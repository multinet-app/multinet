import test from 'tape';
import puppeteer from 'puppeteer';

const width = 1920;
const height = 1080;

// Opens the chromium window
function browser(width, height) {
    return puppeteer.launch({
    headless: true,
    args: [`--window-size=${width},${height}`],
    // slowMo: 20 // For testing
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function create_workspace(p, name) {
    await p.waitForSelector("#add-workspace");
    await p.click("#add-workspace")
    await p.waitForSelector("#workspace-name");
    await p.focus('#workspace-name')
    await p.keyboard.type(name)
    await p.click("#create-workspace")
}

test('e2e-client-test-valid-actions', async (t) => {
    // Arrange: Set up the page
    const b = await browser(width, height);
    const p = await b.newPage();
    await p.setViewport({ width, height });
    await p.goto("http://127.0.0.1:8080/");
    
    // Act: Test creating a workspace
    await create_workspace(p, 'puppeteer')

    // Assert: Check that the new workspace exists with no tables
    await p.waitForSelector(".v-list-item");
    await p.waitForSelector(".v-list-item__title");
    const workspace_name = await p.evaluate(() => document.querySelector('.v-list-item__title').innerText);
    t.equal(workspace_name, "puppeteer", "The new workspace is created and called the right thing.")

    // Assert: Check that there are no tables or graphs yet
    await p.waitForSelector(".ws-detail-empty-list");
    let tables = await p.evaluate(() => document.querySelectorAll('.ws-detail-empty-list')[0].innerText.split("info ")[1]);
    t.equal(tables, "There's nothing here yet...", "The new workspace has no tables.")

    let graphs = await p.evaluate(() => document.querySelectorAll('.ws-detail-empty-list')[1].innerText.split("info ")[1]);
    t.equal(graphs, "There's nothing here yet...", "The new workspace has no graphs.")

    // Act: Add a node table, an edge table, and a graph
    await p.waitForSelector("#add-table");
    await p.click("#add-table")
    await p.focus('#table-name')
    await p.keyboard.type('nodes')
    // await p.click("#file-selector")

    // Assert: Check the tables and graph exist


    // Act: Check that the tables imported correctly, the data should show what we expect


    await b.close();

    t.end();
});

test('e2e-client-test-invalid-actions', async (t) => {
    // Arrange: Set up the page
    const b = await browser(width, height);
    const p = await b.newPage();
    await p.setViewport({ width, height });
    await p.goto("http://127.0.0.1:8080/");
    
    // Act: Test creating invalid workspaces
    await create_workspace(p, '123')
    await p.click("#workspace-name", { clickCount: 3 })
    await p.click("#add-workspace") // Close the modal

    await create_workspace(p, '++--==__')
    await p.click("#workspace-name", { clickCount: 3 })
    await p.click("#add-workspace") // Close the modal

    await create_workspace(p, "a")

    // Assert: Check that the new workspace exists with no tables
    await sleep(200)
    await p.waitForSelector(".v-list-item");
    await p.waitForSelector(".v-list-item__title");
    const workspace_name = await p.evaluate(() => document.querySelectorAll('.v-list-item__title')[0].innerText);
    t.equal(workspace_name, "a", "Invalid workspaces weren't created but the last valid one was.")

    // Act: Try to add broken versions of a node table, an edge table, and a graph
    await p.waitForSelector("#add-table");
    await p.click("#add-table")
    await p.focus('#table-name')
    await p.keyboard.type('nodes')
    // await p.click("#file-selector")

    // Assert: Check the tables and graph exist


    // Act: Check that the tables imported correctly, the data should show what we expect


    await b.close();

    t.end();
});