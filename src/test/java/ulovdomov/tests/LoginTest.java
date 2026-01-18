package ulovdomov.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.*;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import ulovdomov.pages.LoginPage;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.*;

public class LoginTest {
    private static WebDriver driver;
    private static LoginPage loginPage;
    private static final String BASE_URL  = System.getenv("BASE_URL") != null
            ? System.getenv("BASE_URL") : "https://www.ulovdomov.cz";
    private static final String EMAIL     = System.getenv("TEST_USER_EMAIL");
    private static final String PASSWORD  = System.getenv("TEST_USER_PASSWORD");

    @BeforeAll
    static void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless", "--no-sandbox", "--disable-dev-shm-usage");
        driver = new ChromeDriver(options);
        loginPage = new LoginPage(driver);
    }

    @AfterAll
    static void tearDown() {
        if (driver != null) driver.quit();
    }

    @BeforeEach
    void navigateToHome() {
        loginPage.openUrl(BASE_URL);
    }

    @Test
    void loginWithValidCredentials() {
        assumeTrue(EMAIL != null && PASSWORD != null, "Skipping: TEST_USER_EMAIL / TEST_USER_PASSWORD not set");
        loginPage.openLoginModal();
        loginPage.login(EMAIL, PASSWORD);
        assertTrue(loginPage.isLoggedIn(), "Login modal should close after successful login");
    }
}
