export const ZucoraUILocators = {
    login: {
      dobInputField: "//input[@formcontrolname='dob']"
    },
    errors: {
      emailError: "//mat-error[contains(.,'Please enter a valid email address')]",
      emptyEmailError: "//mat-error[contains(.,'Email is required')]",
    },
    dashboard: {
      zucoraDashboard: "//span[contains(text(), ' Bill Center ')]",     
      signOutButton: "//button[contains(.,' Sign out ')]"
    },
    userManagement: {
      patientPayLogoBtnPath: "//button[contains(@class,'logo-btn')]",
      patientPayLogoImgPath: "//img[contains(@class,'app-logo') and contains(@alt,'Patientpay logo')]",
      headerBillCenter: "//button[contains(@class,'header-button') and contains(.,'Bill Center')]",
      headerMyAccount: "//span[contains(text(), ' My Account ')]",
      headerHelp: "//button[contains(@class,'header-button') and contains(.,'Help')]",
      headerSignout: "//button[contains(@class,'header-button') and contains(.,'Sign out')]",
    }
};
  