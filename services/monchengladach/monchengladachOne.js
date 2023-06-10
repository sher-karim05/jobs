import scroll from "../../utils/scroll.js";
import print from "../../utils/print.js";
import save from "../../utils/save.js";

let monchengladachOne = async (cluster,page, positions,levels) => {
  try {
   
    await page.goto(
      "https://wirsuchenmenschen.de/jobs/?jq=neuwerk&city=M%C3%B6nchengladbach#mode-grid",
      {
        waitUntil: "load",
        timeout: 0,
      }
    );

    await scroll(page);

    //get all jobLinks
    await page.waitForTimeout(1000)
    const jobLinks = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          "#tx-solr-job-offers-list_search > div > div.image > a "
        )
      ).map((el) => el.href);
    });

    console.log(jobLinks);
    let allJobs = [];

    for (let jobLink of jobLinks) {
      cluster.queue(async ({ page }) => {
      let job = {
        title: "",
        location: "Münster",
        hospital: "Herz-Jesu-Krankenhaus Münster",
        link: "",
        level: "",
        position: "",
        email: "",
        republic: "North Rhine-Westphalia",
        city:"Münster"
      };

      await page.goto(jobLink, {
        waitUntil: "load",
        timeout: 0,
      });

      await page.waitForTimeout(1000);

      let title = await page.evaluate(() => {
        let ttitle = document.querySelector(".ce-bodytext > h1");
        return ttitle ? ttitle.innerText : "";
      });
      job.title = title;

      let text = await page.evaluate(() => {
        return document.body.innerText;
      });
      //get level
      let level = text.match(/Facharzt|Chefarzt|Assistenzarzt/);
      let position = text.match(/arzt|pflege/);
      job.level = level ? level[0] : "";
      if (
        level == "Facharzt" ||
        level == "Chefarzt" ||
        level == "Assistenzarzt" ||
        level == "Arzt" ||
        level == "Oberarzt"
      ) {
        job.position = "artz";
      }
      if (position == "pflege" || (position == "Pflege" && !level in levels)) {
        job.position = "pflege";
        job.level = "Nicht angegeben";
        }
        let link = await page.evaluate(() => {
        let apply = document.querySelector(
          "#tx-jobs-offers-details > div.page-headline-pull > div > div.lead-text > div > div.btn-group.job-links > a"
        );
        return apply ? apply.href : "";
      });

        job.link = link;
        let email = await page.evaluate(() => {
          return document.body.innerText.match(
            /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/gi
          );
        });
        job.email = String() + email;
        if (positions.map(el => el.toLowerCase()).includes(job.position.toLowerCase())) {
          await save(job);
        }
      });
    }
   
  } catch (e) {
    print(e);
  }
};


 
export default monchengladachOne;
