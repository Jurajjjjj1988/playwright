package ulovdomov.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class LoginPage extends BasePage {
    private static final By HAMBURGER_MENU   = By.cssSelector("[data-test='navbar.hamburgerButton']");
    private static final By LOGIN_LINK       = By.xpath("//span[text()='Přihlásit se']");
    private static final By EMAIL_INPUT      = By.cssSelector("[data-test='loginModal.signIn.form.emailInput']");
    private static final By PASSWORD_INPUT   = By.cssSelector("[data-test='loginModal.signIn.form.passwordInput']");
    private static final By SUBMIT_BUTTON    = By.cssSelector("[data-test='loginModal.signIn.form.button']");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public void openLoginModal() {
        waitForClickable(HAMBURGER_MENU).click();
        waitForClickable(LOGIN_LINK).click();
        waitForVisible(EMAIL_INPUT);
    }

    public void login(String email, String password) {
        WebElement emailField = waitForClickable(EMAIL_INPUT);
        emailField.clear();
        emailField.sendKeys(email);

        WebElement passwordField = waitForClickable(PASSWORD_INPUT);
        passwordField.clear();
        passwordField.sendKeys(password);

        waitForClickable(SUBMIT_BUTTON).click();
    }

    public boolean isLoggedIn() {
        try {
            wait.until(ExpectedConditions.invisibilityOfElementLocated(EMAIL_INPUT));
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
