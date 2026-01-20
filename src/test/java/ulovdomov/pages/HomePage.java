package ulovdomov.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class HomePage extends BasePage {
    private static final By HERO_HEADING    = By.cssSelector("[data-test='undefined.content.title']");
    private static final By LOCATION_INPUT  = By.xpath("//input[contains(@placeholder,'město, ulice')]");
    private static final By SEARCH_BUTTON   = By.xpath("//a[contains(text(),'Hledat bydlení')]");
    private static final By LISTING_PROMO   = By.cssSelector("[data-test='listingsPromo.heading']");
    private static final By SHOW_MORE_RENT  = By.xpath("//a[contains(text(),'Zobrazit další pronájmy')]");
    private static final By SHOW_MORE_SALE  = By.xpath("//a[contains(text(),'Zobrazit další prodeje')]");
    private static final By POST_AD_BUTTON  = By.cssSelector("[data-test='navbar.content.addOffer']");
    private static final By LOGO            = By.cssSelector("[data-test='navbar.logoUlovDomov']");

    public HomePage(WebDriver driver) {
        super(driver);
    }

    public void open(String baseUrl) {
        driver.get(baseUrl + "/");
        dismissCookieBanner();
    }

    public void searchByLocation(String location) throws InterruptedException {
        WebElement input = waitForClickable(LOCATION_INPUT);
        input.click();
        input.sendKeys(location);
        Thread.sleep(1500);
        List<WebElement> suggestions = driver.findElements(
            By.xpath("//div[@role='dialog']//span[text()='" + location + "']")
        );
        if (!suggestions.isEmpty()) {
            suggestions.get(0).click();
        }
    }

    public void submitSearch() {
        waitForClickable(SEARCH_BUTTON).click();
    }

    public void clickPostAd() {
        waitForClickable(POST_AD_BUTTON).click();
    }

    public void clickLogo() {
        waitForClickable(LOGO).click();
    }

    public boolean isLoaded() {
        try {
            waitForVisible(HERO_HEADING);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean areListingSectionsVisible() {
        try {
            return !driver.findElements(LISTING_PROMO).isEmpty()
                && !driver.findElements(SHOW_MORE_RENT).isEmpty()
                && !driver.findElements(SHOW_MORE_SALE).isEmpty();
        } catch (Exception e) {
            return false;
        }
    }
}
