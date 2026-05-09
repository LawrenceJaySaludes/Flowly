function Header({ title, rightElement }) {
  return (
    <header className="relative mb-5 mt-1 flex items-center justify-center">
      <h1 className="text-3xl font-semibold tracking-tight text-textPrimary">{title}</h1>
      {rightElement && <div className="absolute right-0 flex-shrink-0">{rightElement}</div>}
    </header>
  )
}

export default Header
