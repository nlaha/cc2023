const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// read csv file using fast-csv
const fs = require("fs");
const csv = require("fast-csv");

let data = [];

fs.createReadStream("class_prefixes.csv")
  .pipe(csv.parse({ headers: false }))
  .on("error", (error) => console.error(error))
  .on("data", (row) => {
    data.push(row[0]);
  })
  .on("end", (count) => {
    data.forEach((row) => {
      console.log(row);

      // scrape the data from the website
      const rp = require("request-promise");
      const { load } = require("cheerio");
      const url = `https://catalog.wsu.edu/Pullman/Courses/BySubject/${row}`;

      rp(url)
        .then(function (html) {
          $ = load(html);
          $("p.course").each((i, course) => {
            console.log(course);
            let course_header = $(course).find("span.course_header").text();

            let description = $(course).find("span.course_data").text();

            let course_number = course_header.split(" ")[0];
            let course_name = course_header.split(" ").slice(1).join(" ");

            prisma.class
              .create({
                data: {
                  name: course_name,
                  number: row + " " + course_number,
                  description: description,
                  enrolled: 0,
                  capacity: 100,
                },
              })
              .then((data) => {
                console.log(data);
              })
              .catch((err) => {
                console.log(err);
              });
          });
        })
        .catch(function (err) {
          //handle error
        });
    });
  });
