/*********************************************************************************
*  WEB700 – Assignment-6
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Regan Basnet Student ID: 130377237 Date:4/6/2024
*  Online (Cycliic) Link: 

********************************************************************************/ 

// Required modules
const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const path = require("path");
const collegeData = require("./modules/collegeData.js");
const exphbs = require('express-handlebars');

const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts/'),
    helpers: {
        navLink: function(url, options){
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active"' : ' class="nav-item"') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (options.fn) {
                if (lvalue === rvalue) {
                    return options.fn(this);
                } else {
                    return options.inverse(this);
                }
            }
            return lvalue === rvalue;
        }
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

var collegeDataModule = require("./modules/collegeData.js");

app.use(function(req, res, next){
    let route = req.path.substring(1);
    app.locals.activeRoute = '/' + (route == '/' ? '' : route);
    next();
});

collegeDataModule.initialize().then(() => {
    console.log("Data initialized. Setting up the routes.");

    app.use(express.static(path.join(__dirname, 'views')));

    app.get("/", (req, res) => {
        res.render("home", {
            title: "Home Page"
        });
    });

    app.get("/students", (req, res) => {
        collegeDataModule.getAllStudents()
            .then(students => {
                if (students.length > 0) {
                    res.render("students", { students: students });
                } else {
                    res.render("students", { message: "no results" });
                }
            })
            .catch(err => {
                console.error("Error retrieving students: ", err);
                res.render("students", { message: "unable to fetch students" });
            });
    });

    app.get("/courses", (req, res) => {
        collegeDataModule.getCourses()
            .then((data) => {
                if (data.length > 0) {
                    res.render("courses", { courses: data });
                } else {
                    res.render("courses", { message: "no results" });
                }
            })
            .catch(err => {
                console.error(err);
                res.render("courses", { message: "unable to fetch courses" });
            });
    });

    app.get("/about", (req, res) => {
        res.render("about")
    });

    app.get("/htmlDemo", (req, res) => {
        res.render('htmlDemo');
    });

    app.get("/students/add", (req, res) => {
        collegeDataModule.getCourses()
            .then(courses => {
                res.render("addStudent", { courses: courses });
            })
            .catch(err => {
                console.error(err);
                res.render("addStudent", { courses: [] });
            });
    });

    app.post("/students/add", (req, res) => {
        if (req.body.course === "") {
            req.body.course = null;
        }
    
        collegeDataModule.addStudent(req.body)
            .then(() => {
                res.redirect("/students");
            })
            .catch((err) => {
                console.error(err);
                collegeDataModule.getCourses()
                    .then(courses => {
                        res.render("addStudent", { 
                            error: "Unable to add student", 
                            studentData: req.body, 
                            courses: courses 
                        });
                    })
                    .catch(err => {
                        res.render("addStudent", { 
                            error: "Unable to add student", 
                            studentData: req.body, 
                            courses: [] 
                        });
                    });
            });
    });

    app.get("/course/:id", (req, res) => {
        collegeDataModule.getCourseById(req.params.id)
            .then((course) => {
                console.log(course);
                res.render("course", { course: course });
            })
            .catch((err) => {
                console.error(err);
                res.render("course", { message: "This course does not exist." });
            });
    });

    app.get('/student/:studentNum', (req, res) => {
        let viewData = {};
    
        collegeDataModule.getStudentByNum(req.params.studentNum).then((student) => {
            if (student) {
                viewData.student = student;
            } else {
                viewData.student = null;
            }
        }).catch((err) => {
            viewData.student = null;
        }).then(collegeDataModule.getCourses)
        .then((courses) => {
            viewData.courses = courses;
            res.render("student", { viewData: viewData });
        }).catch((err) => {
            viewData.courses = [];
            res.render("student", { viewData: viewData });
        });
    });

    app.post('/student/update', (req, res) => {
        collegeDataModule.updateStudent(req.body)
            .then(() => {
                res.redirect('/students');
            })
            .catch(err => {
                console.error(err);
                res.status(500).send("Unable to update student.");
            });
    });

    app.get("/courses/add", (req, res) => {
        res.render("addCourse");
    });

    app.post("/courses/add", (req, res) => {
        collegeDataModule.addCourse(req.body)
            .then(() => {
                res.redirect("/courses");
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Unable to add course");
            });
    });

    app.get("/courses/update/:id", (req, res) => {
        collegeDataModule.getCourseById(req.params.id)
            .then((course) => {
                if (course) {
                    res.render("updateCourse", { course: course });
                } else {
                    res.status(404).send("Course Not Found");
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Unable to retrieve course for update");
            });
    });

    app.post("/courses/update", (req, res) => {
        collegeDataModule.updateCourse(req.body)
            .then(() => {
                res.redirect("/courses");
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Unable to update course");
            });
    });

    app.get("/courses/delete/:id", (req, res) => {
        collegeDataModule.deleteCourseById(req.params.id)
            .then(() => {
                res.redirect("/courses");
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Unable to remove course");
            });
    });

    app.get('/student/delete/:studentNum', (req, res) => {
        collegeDataModule.deleteStudentByNum(req.params.studentNum)
        .then((msg) => {
            res.redirect('/students');
        })
        .catch((err) => {
            res.status(500).send(err);
        });
    });

    app.use((req, res) => {
        res.status(404).send("Page Not Found");
    });

    app.listen(HTTP_PORT, () => {
        console.log("Server listening on port: " + HTTP_PORT);
    });

}).catch(err => {
    console.error("Failed to initialize data:", err);
});
