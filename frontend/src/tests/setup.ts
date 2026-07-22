import '@testing-library/jest-dom/vitest'

// Every test starts with clean browser storage so auth state can't leak
// between tests.
afterEach(() => {
  localStorage.clear()
})
