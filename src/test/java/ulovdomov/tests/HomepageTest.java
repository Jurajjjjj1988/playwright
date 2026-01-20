package ulovdomov.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.*;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import ulovdomov.pages.HomePage;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class HomepageTest {
    private static WebDriver driver;
    private static HomePage homePage;
    private static final String BASE_URL = System.getenv("BASE_URL") != null
            ? System.getenv("BASE_URL") : "https://www.ulovdomov.cz";

    @BeforeAll
    static void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless", "--no-sandbox", "--disable-dev-shm-usage");
        driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        homePage = new HomePage(driver);
    }

    @AfterAll
    static void tearDown() {
        if (driver != null) driver.quit();
    }

    @Test
    @Order(1)
    void homepageLoads() {
        homePage.open(BASE_URL);
        assertTrue(homePage.isLoaded(), "Hero heading should be visible");
    }

    @Test
    @Order(2)
    void listingSectionsVisible() {
        homePage.open(BASE_URL);
        assertTrue(homePage.areListingSectionsVisible(), "Listing promo sections should be visible");
    }
}
