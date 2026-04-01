import { Platform } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../supabase";

WebBrowser.maybeCompleteAuthSession();

function getRedirectTo() {
  if (Platform.OS === "web") {
    return makeRedirectUri();
  }

  return makeRedirectUri({
    native: "flowly://auth/callback",
    path: "auth/callback",
    scheme: "flowly",
  });
}

export async function signInWithGoogle() {
  const redirectTo = getRedirectTo();

  if (__DEV__) {
    console.log("Google OAuth redirectTo:", redirectTo);
  }

  if (Platform.OS === "web") {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.url) {
    throw new Error("Unable to start Google sign in.");
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === "cancel" || result.type === "dismiss") {
    return null;
  }

  if (result.type !== "success" || !result.url) {
    throw new Error("Google sign in was not completed.");
  }

  const { params, errorCode } = QueryParams.getQueryParams(result.url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (!accessToken || !refreshToken) {
    throw new Error("Google sign in did not return a full session.");
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

  if (sessionError) {
    throw sessionError;
  }

  return sessionData;
}
