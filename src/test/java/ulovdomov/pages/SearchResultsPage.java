package ulovdomov.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

import java.util.List;

public class SearchResultsPage extends BasePage {
    private static final By SORT_SELECT   = By.cssSelector("select");
    private static final By LISTING_CARDS = By.cssSelector("[data-test='previewOfferLeases']");
    private static final By PAGE_HEADING  = By.cssSelector("h1");
    private static final By MAP_CONTAINER = By.cssSelector("[data-test='mapOfLeases']");

    public SearchResultsPage(WebDriver driver) {
        super(driver);
    }

    public void sortBy(String option) throws InterruptedException {
        WebElement select = waitForClickable(SORT_SELECT);
        new Select(select).selectByVisibleText(option);
        Thread.sleep(2000);
        dismissCookieBanner();
    }

    public void clickFirstListing() {
        List<WebElement> cards = driver.findElements(LISTING_CARDS);
        if (!cards.isEmpty()) {
            cards.get(0).click();
        }
    }

    public boolean areResultsLoaded() {
        try {
            waitForVisible(LISTING_CARDS);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isMapVisible() {
        try {
            return waitForVisible(MAP_CONTAINER).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public String getPageHeading() {
        return waitForVisible(PAGE_HEADING).getText();
    }

    public boolean urlContains(String text) {
        return driver.getCurrentUrl().contains(text);
    }
}
