export {}

declare global {
  // when running as a container-bound Apps Script project, this application has
  // access to google.script.run to call the backend functions hosted on the
  // Apps Script server.
  const google: {
    script: {
      run: {
        withFailureHandler: any
        withSuccessHandler: any
        showWebPageTestDialog: any
        runtests: any
      }
    }
  }
}
