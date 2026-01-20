package ulovdomov.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.*;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import ulovdomov.pages.HomePage;
import ulovdomov.pages.SearchResultsPage;

import static org.junit.jupiter.api.Assertions.*;

public class SearchTest {
    private static WebDriver driver;
    private static HomePage homePage;
    private static SearchResultsPage searchResultsPage;
    private static final String BASE_URL = System.getenv("BASE_URL") != null
            ? System.getenv("BASE_URL") : "https://www.ulovdomov.cz";

    @BeforeAll
    static void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless", "--no-sandbox", "--disable-dev-shm-usage");
        driver = new ChromeDriver(options);
        homePage = new HomePage(driver);
        searchResultsPage = new SearchResultsPage(driver);
    }

    @AfterAll
    static void tearDown() {
        if (driver != null) driver.quit();
    }

    @Test
    void searchByLocationShowsResults() throws InterruptedException {
        homePage.open(BASE_URL);
        homePage.searchByLocation("Praha");
        homePage.submitSearch();
        assertTrue(searchResultsPage.urlContains("praha"), "URL should contain searched location");
        assertTrue(searchResultsPage.areResultsLoaded(), "Listing cards should be visible");
    }

    @Test
    void sortByPriceAscending() throws InterruptedException {
        driver.get(BASE_URL + "/pronajem/byty/praha");
        searchResultsPage.sortBy("Nejlevnější");
        assertTrue(searchResultsPage.areResultsLoaded(), "Results should remain visible after sort");
    }
}
