function activate(flags, flag) {
  return 1 << flag | flags
}

function deactivate(flags, flag) {
  return ~(1 << flag) & flags
}

function flip(flags, flag) {
  return isActive(flags, flag) ? deactivate(flags, flag) : activate(flags, flag)
}

function isActive(flags, flag) {
  return (flags & (1 << flag)) !== 0
}

export default { activate, deactivate, isActive, flip }
