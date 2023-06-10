import scroll from "../utils/scroll.js";
import print from "../utils/print.js";
import save from "../utils/save.js";


let gemein = async (cluster,page,positions,levels) => {
  try {
    
    await page.goto("https://www.gk-bonn.de/gkbn/bildung-karriere/stellenboerse/", {
      waitUntil: "load",
      timeout: 0,
    });

    await scroll(page);

    //get all jobLinks
    const jobLinks = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll("h2 a")
      ).map((el) => el.href);
    });

    console.log(jobLinks);
    let allJobs = [];

    for (let jobLink of jobLinks) {
      cluster.queue(async({page}) =>{
      let job = {
        city: "Gemein schafts KranKenKus",
        title: "",
        location: "Prinz-Albert Str. 40, 53113 Bonn Simski",
        hospital: "House St. Elisabeth, Prinz-Albert -Strabe 40, 53113 Bonn",
        link: "",
        level: "",
        position: "",
        republic:"North Rhine-Westphalia",
        email: "",
      };

      await page.goto(jobLink, {
        waitUntil: "load",
        timeout: 0,
      });

      await page.waitForTimeout(1000);

      let title = await page.evaluate(() => {
        let ttitle = document.querySelector("h1");
        return ttitle ? ttitle.innerText : null;
      });
      job.title = title;
  // get email
  job.email = await page.evaluate(() => {
    return document.body.innerText.match(/\w+.\w+\@\w+\-\w+.\w+/).toString() || "N/A";
   }); 
    // get location
  // job.location = await page.evaluate(() => {
  // let loc = document.querySelector(".arbeitsort").innerText;
  // return loc.match(/[a-zA-Z-.].+ \d+[\n]\d+ [a-zA-Z-.].+/, "");
  // });
      let text = await page.evaluate(() => {
        return document.body.innerText;
      });
      //get level
      let level = text.match(/Facharzt|Chefarzt|Assistenzarzt/|"Arzt"|"Oberarzt");
      let position = text.match(/arzt|pflege/);
      job.level = level ? level[0] : "";
      if (
        level == "Facharzt" ||
        level == "Chefarzt" ||
        level == "Assistenzarzt"
      ) {
        job.position = "artz";
      }
      if (position == "pflege" || (position == "Pflege" && !level in levels)) {
        job.position = "pflege";
        job.level = "Nicht angegeben";
      }

      if (!position in positions) {
        continue;
      }
      let link1 = 0;
      if (link1) {
        const link = await page.evaluate(() => {
          let applyLink = document.querySelector('.#paginate ul li a')
          return applyLink ? applyLink.href : ""
        })
        job.link = link;
        if (positions.map(el => el.toLowerCase()).includes(job.position)) {
          await save(job);
        }
      });
    }
  } catch (e) {
    print(e);
  }
};

export default gemein;





