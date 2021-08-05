// ==UserScript==
// @name       Neopets - Search Helper
// @version    1.0.14
// @match      *://www.neopets.com/auctions.phtml*
// @match      *://www.neopets.com/closet.phtml*
// @match      *://www.neopets.com/dome/neopets.phtml*
// @match      *://www.neopets.com/faerieland/darkfaerie.phtml*
// @match      *://www.neopets.com/faerieland/employ/employment.phtml*
// @match      *://www.neopets.com/faerieland/hiddentower938.phtml
// @match      *://www.neopets.com/games/kadoatery/*
// @match      *://www.neopets.com/games/kadoatery/index.phtml
// @match      *://www.neopets.com/generalstore.phtml*
// @match      *://www.neopets.com/genie.phtml*
// @match      *://www.neopets.com/halloween/esophagor*.phtml*
// @match      *://www.neopets.com/halloween/witchtower*.phtml*
// @match      *://www.neopets.com/hospital.phtml
// @match      *://www.neopets.com/inventory.phtml*
// @match      *://www.neopets.com/island/*training.phtml?*type=status*
// @match      *://www.neopets.com/island/kitchen*.phtml*
// @match      *://www.neopets.com/island/tradingpost.phtml*
// @match      *://www.neopets.com/market.phtml*
// @match      *://www.neopets.com/market_your.phtml*
// @match      *://www.neopets.com/medieval/earthfaerie.phtml*
// @match      *://www.neopets.com/objects.phtml*
// @match      *://www.neopets.com/pirates/academy.phtml?type=status*
// @match      *://www.neopets.com/process_cash_object.phtml
// @match      *://www.neopets.com/quests.phtml
// @match      *://www.neopets.com/safetydeposit.phtml*
// @match      *://www.neopets.com/shops/wizard.phtml*
// @match      *://www.neopets.com/space/coincidence.phtml
// @match      *://www.neopets.com/winter/igloo2.phtml
// @match      *://www.neopets.com/winter/snowfaerie*.phtml*
// ==/UserScript==

const imgSize = 20; // for the search images

$(`<style type='text/css'>
.searchimg { cursor: pointer; height: ${imgSize}px !important; width: ${imgSize}px !important; }
.search-helper { margin-top: 0; margin-bottom: 0; }
</style>`).appendTo("head");

jQuery.fn.exists = function () {
    return this.length > 0;
};

// if the active pet dropdown image is there, we're in beta
const isBeta = $("[class^='nav-pet-menu-icon']").exists();

const linkmap = { // for urls and images for each search type
    // if the image is not from images.neopets.com, base64 it
    ssw: {
        "img": "http://images.neopets.com/premium/shopwizard/ssw-icon.svg"
    },
    sw: {
        "url": "http://www.neopets.com/shops/wizard.phtml?string=%s",
        "img": "http://images.neopets.com/themes/h5/basic/images/shopwizard-icon.png"
    },
    tp: {
        "url": "http://www.neopets.com/island/tradingpost.phtml?type=browse&criteria=item_exact&search_string=%s",
        "img": "http://images.neopets.com/themes/h5/basic/images/tradingpost-icon.png"
    },
    au: {
        "url": "http://www.neopets.com/genie.phtml?type=process_genie&criteria=exact&auctiongenie=%s",
        "img": "http://images.neopets.com/themes/h5/basic/images/auction-icon.png"
    },
    sdb: {
        "url": "http://www.neopets.com/safetydeposit.phtml?obj_name=%s&category=0",
        "img": "http://images.neopets.com/images/emptydepositbox.gif"
    },
    closet: {
        "url": "http://www.neopets.com/closet.phtml?obj_name=%s",
        "img": "http://images.neopets.com/items/ffu_illusen_armoire.gif"
    },
    jni: {
        "url": "https://items.jellyneo.net/search/?name=%s&name_type=3",
        "img": "http://images.neopets.com/items/toy_plushie_negg_fish.gif"
    },
    battlepedia: {
        "url": "http://battlepedia.jellyneo.net/index.php?search=%s",
        "img": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAChklEQVQ4T5XRW0iTARQH8P83Vi7n2CUvm0hroW7aFK1t+nkBe1BYK7KHoCYZXpplPUTkQ0WQQg9FIURiZHRDs8wEK6QNibFhZagT3drmFadJlq3mnM55+cIvIqKmdZ4Pv/M/5xAhigO5LOaGWI975hkGXnzAfxbBSy84oi3Q3vP7/Qv91n6Tw+547PXOtMPeNvYvFoFYdUTJsaPDMTExHKlUitnZWej1+hm705n0/sll13oIsdqgKLyoL9Pp8qanp8FgMCAQCNDU1GQnNi4qDVcrfGshNMAnC05UVlXdYLFYcDqdEIlE8Hg8MJvN9cbaisPrApDtji8pLXWQJElQFAWXywU2m43x8XEMj46Uvbx28lYwhE5AV4I6XbNnb4P2kHab2+3G5OQknSIQCMzdrqlOwYhpcLUtTY7k8DBGoW9h5ZHRgq5fAIDoHF345kh+XVZWdr5EIoHNZgOXy4XF0tNn7m5WkP5uTrGasHFCIbz5HK1GC5X/G/AzzJa84zqpTFotl8tDV9OIxWI0NjY2cB0116+UL3XWGxAYmqBkpj6M/hWgofgcWUSUuE6pUmUxmUzExcWht+V8a1Hq2319I0CHldJ09KMtOPAjDhGmPFiVmJhQIRQKQySCuTenxKfJM7VwTXyhVJ1WTK0J5KSA551H6s4d0Q/ZYtKrkQ5EGgxWbs8gcbe9a6WYnhDsPRkJECu3E3VFauQ6xoCtIqDFBETwgKVl4NNXuLqGKEVQQJOOc8Ua4tI7OxY/ukF99sDhm6OeZsiJyig+kJkEXLhDnQ0K7EpGGmsTUe3zU/f9C2gOZWHZ2ItvJRqic382VK+t9CF16x3xjw0zpeDw+CifD2DqVQ8efAfoI/lhtfaY7AAAAABJRU5ErkJggg=="
    },
    dti: {
        "img": "data:image/gif;base64,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"
    }
};

// user has premium toolbar
let premium = false;
if (isBeta) {
    premium = $("[class^='navsub-ssw-icon']").exists();
} else {
    premium = $("#sswmenu .imgmenu").exists();
}

function combiner(item, url, image) {
    url = url.replace("%s", item);
    return `<a tabindex='-1' target='_blank' href='${url}'><img src='${image}' class='searchimg'></a>`;
}

function sswlink(item) {
    // the only different one because it doesn't use a URL
    return `<img item='${item}' class='ssw-helper searchimg' src='${linkmap.ssw.img}'>`;
}

function inURL(substr) {
    return document.URL.includes(substr);
}

function cleanItem(item) {
    return item.replaceAll("!", "%21")
               .replaceAll("#", "%23")
               .replaceAll("&", "%26")
               .replaceAll("(", "%28")
               .replaceAll(")", "%29")
               .replaceAll("*", "%2A")
               .replaceAll("+", "%2B")
               .replaceAll(",", "%2C")
               .replaceAll("/", "%2F")
               .replaceAll(":", "%3A")
               .replaceAll("?", "%3F")
               .replaceAll(" ", "+");
}

// overall linker thing
function makelinks(item, extras) {
    // extras is an object that can only have boolean of 'cash' and 'wearable' (for now) | and a string/int number 'itemid' (only needed for wearable being true)
    let links = "";

    item = $.trim(item);
    if (typeof extras === "undefined") {
        extras = {cash: false, wearable: false, tradeable: true};
    }

    if (typeof extras.tradeable === "undefined") {
        extras.tradeable = true;
    }

    const sswurl = sswlink(item);
    const name = cleanItem(item);

    if (extras.cash === false && extras.tradeable === true) {
        if (inURL("quests.phtml") === false) { // doesn't show either SW if you're on a quest
            // SSW
            if (premium) {
                links += sswurl;
            }

            // Regular SW
            links += combiner(name, linkmap.sw.url, linkmap.sw.img);
        }

        // TP
        links += combiner(name, linkmap.tp.url, linkmap.tp.img);

        // Auctions
        links += combiner(name, linkmap.au.url, linkmap.au.img);
    }

    // SDB
    if (inURL("safetydeposit") === false) {
        links += combiner(name, linkmap.sdb.url, linkmap.sdb.img);
    }

    // Closet
    if (extras.wearable && inURL("closet.phtml") === false) {
        links += combiner(name, linkmap.closet.url, linkmap.closet.img);
    }

    // JN items
    links += combiner(name, linkmap.jni.url, linkmap.jni.img);

    // Battlepedia
    if (inURL("dome")) {
        links += combiner(name, linkmap.battlepedia.url, linkmap.battlepedia.img);
    }

    // DTI
    if (extras.wearable) {
        let link = "http://impress-2020.openneo.net/items/search/%s";
        if (extras.itemid !== -1 && typeof extras.itemid != "undefined") {
            link = `http://impress-2020.openneo.net/items/${extras.itemid}`;
        }
        // Beta DTI uses %20 as space, instead of + like other things
        let dti_name = cleanItem(item.replaceAll(" ", "%20"));
        links += combiner(dti_name, link, linkmap.dti.img);
    }

    // Changed quests to use div, because p makes the text spill out of RE box
    const element = inURL("quests.phtml") ? "div" : "p";
    const helper = $(`<${element} class='search-helper'>${links}</${element}>`);

    // TODO: remove when TP is converted (hopefully)
    // because of how ugly this makes the TP, let's inline it
    let isOnTP = inURL("/island/tradingpost.phtml");
    if (isOnTP) {
        helper.css({
            "display": "inline-block",
            "margin-left": "4px"
        });
    }

    return helper;
}

jQuery.fn.justtext = function () {
    return $(this).clone().children().remove().end().text();
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// I don't really approve of doing the code this way, but in an effort to save as few headaches as possible
// for the countless people who may use this, it's easier to just put beta & non-beta into one file.
// As pages are converted, they will be removed from the non-beta half of the following if-statement, as TNT
// mentioned in their end-of-flash update that beta pages will be the default when those pages are done.
// That said, the point of no return starts here. May Sloth have mercy on us.

if (isBeta) {
    /*
     Adds the search icons under things in:
     Main Shops
     Inventory
     Kitchen Quest
     Snow Faerie Quests
     Illusen/Jhudora
    */

    // Common functions go here
    function hasSearchHelper(element) {
        // this will be used in ajaxSuccess handlers, as to not flood the page after hot-reloads
        return $(element).parent().find(".search-helper").length !== 0;
    }

    function genericQuest() {
        // so far, we know this works on:
        // Kitchen Quests
        // Snow Faerie Quests

        // due to inconsistencies in the ajax requests, we will attempt to do two different kinds of search helper adds
        $(".item-img + .item-name").find("b").each(function (index, element) {
            if (!hasSearchHelper(element)) {
                $(element).after(makelinks($(element).text()));
            }
        });

        $("img[src*='/items/'] + br + p > b").each(function (index, element) {
            if (!hasSearchHelper(element)) {
                $(element).after(makelinks($(element).text()));
            }
        });
    }

    // Main Shops
    if (inURL("objects.phtml") || inURL("type=shop")) {
        $(".item-img + .item-name").each(function (index, element) {
            $(element).after(makelinks($(element).text()));
        });
    }

    // Inventory
    if (inURL("inventory")) {
        // the inventory system is more flexible than it used to be, so we have to do this a little differently
        $(document).ajaxSuccess(
            function () {
                $(".item-img + .item-name").each(function (index, element) {
                    // this will add more and more if you do things like SSW searching, so check first
                    if (!hasSearchHelper(element)) {
                        let extras = {
                            cash: document.getElementById("invDisplay").dataset.type === "nc",
                            wearable: $(element).parent().find(":contains('wearable')").length > 0,
                            tradeable: $(element).parent().find(":contains('(no trade)')").length === 0,
                            itemid: -1
                        };
                        $(element).after(makelinks($(element).text(), extras));
                    }
                });
            }
        );
    }

    // Kitchen Quest
    if (inURL("island/kitchen")) {
        genericQuest();
        $(document).ajaxSuccess(genericQuest);
    }

    // Snow Faerie
    if (inURL("winter/snowfaerie")) {
        genericQuest();
        $(document).ajaxSuccess(genericQuest);
    }

    // Esophagor
    if (inURL("halloween/esophagor")) {
        genericQuest();
        $(document).ajaxSuccess(genericQuest);
    }

    // Edna
    if (inURL("halloween/witchtower")) {
        genericQuest();
        $(document).ajaxSuccess(genericQuest);
    }

    // Illusen & Jhudora
    if ($(".faerie-img").exists()) {
        let itemname = $(":contains('Where is my') > b").text();
        $(":contains('Where is my')").parent().find("img[src*='/items/']").after(makelinks(itemname));
    }

    // Shop Wiz Auto-Exact
    if (inURL("wizard.phtml?string=")) {
        $("#criteria").val("exact");
    }

    function sswopen(item) {
        // open this in such a way that if the "__2020" was changed/removed without warning, this will still work
        // TODO: hardcode the class name better once out of beta
        $("[class^='ssw-header']").last().parent().show();

        // if results are currently up, close them
        $("#ssw-button-new-search").click();

        $("#ssw-criteria").val("exact");
        $("#searchstr").val(item);
    }
} else {
    /*
     Adds the search icons under things in:
     Inventory
     SDB
     Closet
     Auction Bidding Page
     Your Shop Price Page
     Coincidence
     MI Training School
     KI Training School
     Snow Faerie
     Esophagor
     Edna Quest
     Kitchen Quest
     Illusen/Jhudora
     Employment Agency
     Faerie Quest Page
     Your Shop's Sales History
    */

    // Main Shops
    if (document.URL.includes("objects.phtml?") && document.URL.includes("type=shop")) {
        $("img[src*='/items/']").parent().parent().find("b").each(function (k, v) {
            $(v).after(makelinks($(v).text()));
        });
    }

    // Igloo Garage
    if (document.URL.includes("/winter/igloo2.phtml")) {
        $("img[src*='/items/']").parent().parent().find("b").each(function (k, v) {
            $(v).after(makelinks($(v).text()));
        });
    }

    // Trading Post
    if (document.URL.includes("/island/tradingpost.phtml")) {
        $("img[src*='/items/']").each(function (k, v) {
            $(this.nextSibling).after(makelinks($(this)[0].nextSibling.nodeValue));
        });
    }

    // Hospital
    if (document.URL.includes("/hospital.phtml")) {
        $("img[src*='/items/']").parent().prev().find("b").each(function (k, v) {
            $(v).after(makelinks($(v).text())).before("<br>");
            $(v).parent().width(150);
        });
    }

    // Redeeming Cash
    if (document.URL.includes("process_cash_object")) {
        extras = {cash: true, wearable: true};
        $("img[src*='/items/']").parent().find("b").each(function (k, v) {
            $(v).before("<br>").after(makelinks($(v).text(), extras));
        });
    }

    // Auctions
    if (document.URL.includes("auction_id")) {
        nameb = $("b:contains('owned by')");
        let fixname = nameb.html();
        fixname = fixname.substr(0, fixname.indexOf(" (own")); // remove "owned by..."
        nameb.parent().find("img").after(makelinks(fixname));
    }
    if (document.URL.includes("auctions.phtml") || document.URL.includes("genie.phtml")) {
        $("a[href*='?type=bids&auction_id=']:not(:has('img'))").each(function (index, element) {
            const itemname = $(element).text();
            $(element).after(makelinks(itemname));
        })
    }

    // Inventory
    if (document.URL.includes("inventory")) {
        $("img[src*='/items/']").each(function (k, v) {
            let $nametd = $(v).parent().parent();

            let extras = {cash: $(v).hasClass("otherItem"), wearable: $nametd.hasClass("wearable"), itemid: -1};

            if ($nametd.find("hr").exists()) {
                extras.tradeable = !$nametd.find("span:contains('(no trade)')").exists();
                $nametd.find("hr").before(makelinks($nametd.justtext(), extras));
            } else {
                $nametd.append(makelinks($nametd.justtext(), extras));
            }
        });
    }

    // SDB & Closet
    // only downside is not knowing if something is NC if it's in the closet. Oh well, no way to know.
    if (document.URL.includes("safetydeposit") || document.URL.includes("closet")) {
        $("img[src*='/items/']").each(function (k, v) {
            let id = $(v).parent().parent().find("td").eq(5).find("input").attr("name").match(/\d+/g)[0];

            let iswearable = $(v).parent().parent().find("td").eq(1).text().includes("(wearable)");
            if (document.URL.includes("closet")) { // because it'll always be wearable if it's in the closet...
                iswearable = true;
            }
            let category = $(v).parent().parent().find("td").eq(3);
            let extras = {cash: (category.text().trim() === "Neocash"), wearable: iswearable, itemid: id};
            let nametd = $(v).parent().parent().find("td").eq(1);
            nametd.find("b").eq(0).after(makelinks(nametd.find("b").eq(0).justtext(), extras));
        });
    }

    // Your Shop
    if (document.URL.includes("type=your") || document.URL.includes("market_your") || $("[name=subbynext]").length === 2) { // because pressing the Previous/Next 30 is a POST and has nothing of value in the URL
        $("img[src*='/items/']").each(function (k, v) {
            let nametd = $(v).parent().parent().find("td").eq(0);
            let itemname = nametd.text();
            itemname = itemname.replace(nametd.find(".medText").text(), "");

            nametd.find("b").eq(0).after(makelinks(itemname));
        });
    }

    // Coincidence
    if (document.URL.includes("space/coincidence")) {
        $("img[src*='/items/']").each(function (k, v) {
            nametd = $(v).parent();
            nametd.find("b").eq(0).after(makelinks(nametd.justtext()));
        });
    }

    // MI Training
    if (document.URL.includes("/island/training.phtml?type=status")) {
        $("img[src*='/items/']").each(function (k, v) {
            $(v).after(makelinks($(v).prev().text()));
        });
    }

    // Secret Training
    if (document.URL.includes("/island/fight_training.phtml?type=status")) {
        $("img[src*='/items/']").each(function (k, v) {
            $(v).after(makelinks($(v).prev().text()));
        });
    }

    // KI Training
    if (document.URL.includes("/pirates/academy.phtml?type=status")) {
        $("img[src*='/items/']").each(function (k, v) {
            let nametd = $(v).parent();
            let itemname = nametd.parent().find("td > b").eq(0).text();
            nametd.parent().find("td > b").eq(0).after(makelinks(itemname));
        });
    }

    // Snow Faerie
    // essentially same as kitchen. woo, lazy!
    if (document.URL.includes("winter/snowfaerie")) {
        addhr = (document.URL.includes("snowfaerie2") === false);
        $("img[src*='/items/']").parent().find("b").each(function (k, v) {
            $(v).after(makelinks($(v).text()));
        });
    }

    // Esophagor
    if (document.URL.includes("halloween/esophagor")) {
        $("img[src*='/items/']").each(function (k, v) {
            let itemname = $(v).parent().find("b");
            itemname.after(makelinks(itemname.text()));
        });
    }

    // Edna
    if (document.URL.includes("halloween/witchtower")) {
        $("img[src*='/items/']").each(function (k, v) {
            let itemname = $(v).parent().find("b");
            itemname.after(makelinks(itemname.text()));
        });
    }

    // Kitchen
    if (document.URL.includes("island/kitchen")) {
        $("img[src*='/items/']").parent().find("b").each(function (k, v) {
            $(v).after(makelinks($(v).text()));
        });
    }

    // illusen & jhudora
    if ($("img[src*='ef_2.gif']").exists() || $("img[src*='darkfaeriequest2.gif']").exists()) {
        let itemname = $("center:contains('Where is my') > b").text();
        $("center:contains('Where is my')").parent().find("img[src*='/items/']").after(makelinks(itemname));
    }

    // employment agency
    if (document.URL.includes("employment")) {
        if (document.URL.includes("type=jobs")) {
            $("b:contains('Find')").each(function (k, v) {
                let itemname = $(v).parent().clone().find("b").remove().end().html().split("<br>")[0];
                $($(v)[0].nextSibling).after(makelinks(itemname));
            });
        }
        if (document.URL.includes("job_id")) {
            $("b:contains('Find')").eq(0).after(makelinks($("b:contains('Find')").eq(0).justtext()));
        }
    }

    // Faerie Quests
    if (document.URL.includes("quests.phtml")) {
        $("img[src*='/items/']").each(function (k, v) {
            let itemname = $(v).parent().find("b");
            itemname.after(makelinks(itemname.text()));
        });
    }

    // Kadoatery
    if (document.URL.includes("games/kadoatery")) {
        $("td:contains('You should give it'):not(:contains('Thanks,'))").each(function (k, v) {
            let itemname = $(v).find("strong").last();
            itemname.after(makelinks(itemname.text()));
        });
    }

    // General Store
    if (document.URL.includes("generalstore.phtml")) {
        $("td:contains('Cost'):not(:has('td'))").find("strong").each(function (index, element) {
            $(element).after(makelinks($(element).text()));
        });
    }

    // Hidden Tower
    if (document.URL.includes("hiddentower938.phtml")) {
        $(".content table").find("b:not([style*='red;'])").each(function (index, element) {
            $(element).after(makelinks($(element).text()));
        });
    }

    // Your Shop's Sales History
    if (document.URL.includes("market.phtml?type=sales")) {
        $('[value="Clear Sales History"]').parent().parent().parent().parent().find('tr').each(function (index, element) {
            // make sure it's not the header or footer of this table
            let cell = $(element).find("td").eq(1);
            if (cell.attr('bgcolor') === "#ffffcc") {
                $(cell).append(makelinks($(cell).text()));
            }
        });
    }

    // Battledome
    if (document.URL.includes("/dome/neopets")) {
        $(".equipFrame").each(function (index, element) {
            const itemname = $(element).text().trim();
            if (itemname) { // ignore if empty slot
                $(makelinks(itemname)).appendTo($(element));
            }
        });
        $(".equipTable").css({"overflow-y": "scroll"});
    }

    function sswopen(item) {
        if ($(".sswdrop").hasClass("panel_hidden")) {
            $("#sswmenu .imgmenu").click();
        }

        if ($("#ssw-tabs-1").hasClass("ui-tabs-hide")) {
            $('#ssw-tabs').tabs('select', 0);
        }

        $("#ssw-criteria").val("exact");

        $("#searchstr").val(item);
    }
}

$("body").on("click", ".ssw-helper", function () {
    sswopen($(this).attr("item"));
});
