const Sequelize = require('sequelize');
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'Ol9upRQGL0Uw', {
    host: 'ep-calm-voice-a5jj644y-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query:{ raw: true }
});

const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});

const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

Course.hasMany(Student, { foreignKey: 'course' });

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve('Database synced successfully'))
            .catch(err => {
                console.error('Error syncing the database:', err);
                reject('Unable to sync the database');
            });
    });
};

module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then(students => {
                if (students && students.length > 0) {
                    resolve(students);
                } else {
                    reject("No students found");
                }
            })
            .catch(err => {
                console.error('Error retrieving all students:', err);
                reject("Unable to retrieve students");
            });
    });
};

module.exports.getTAs = function () {
    return new Promise((resolve, reject) => {
        reject("Not implemented");
    });
};

module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then(courses => {
                if (courses && courses.length > 0) {
                    resolve(courses);
                } else {
                    reject("No courses found");
                }
            })
            .catch(err => {
                console.error('Error retrieving courses:', err);
                reject("Unable to retrieve courses");
            });
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise((resolve, reject) => {
        Student.findOne({ where: { studentNum: num } })
            .then(student => {
                if (student) {
                    resolve(student);
                } else {
                    reject("Student not found");
                }
            })
            .catch(err => {
                console.error('Error retrieving student by number:', err);
                reject("Unable to retrieve student by number");
            });
    });
};

module.exports.getStudentsByCourse = function (course) {
    return new Promise((resolve, reject) => {
        Student.findAll({ where: { course: course } })
            .then(students => {
                if (students && students.length > 0) {
                    resolve(students);
                } else {
                    reject("No students found for the course");
                }
            })
            .catch(err => {
                console.error('Error retrieving students by course:', err);
                reject("Unable to retrieve students for the course");
            });
    });
};

module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = studentData.TA ? true : false;
        Student.create(studentData)
            .then(student => {
                resolve(student);
            })
            .catch(err => {
                if (err.name === 'SequelizeValidationError') {
                    console.error('Validation errors:', err.errors.map(e => e.message));
                    reject('Validation error: ' + err.errors.map(e => e.message).join(", "));
                } else {
                    console.error('Error creating student:', err);
                    reject("Unable to create student");
                }
            });
    });
};

module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = studentData.TA ? true : false;
        Student.update(studentData, { where: { studentNum: studentData.studentNum } })
            .then(([affectedRows]) => {
                if (affectedRows > 0) {
                    resolve(`Student updated successfully`);
                } else {
                    reject("No student updated");
                }
            })
            .catch(err => {
                console.error('Error updating student:', err);
                reject("Unable to update student");
            });
    });
};

module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
        Course.findOne({ where: { courseId: id } })
            .then(course => {
                if (course) {
                    resolve(course);
                } else {
                    reject("Course not found");
                }
            })
            .catch(err => {
                console.error('Error retrieving course by ID:', err);
                reject("Unable to retrieve course by ID");
            });
    });
};

module.exports.addCourse = function (courseData) {
    return new Promise((resolve, reject) => {
        for (let prop in courseData) {
            if (courseData[prop] === "") {
                courseData[prop] = null;
            }
        }
        Course.create(courseData)
            .then(course => resolve(course))
            .catch(err => reject("Unable to create course"));
    });
};

module.exports.updateCourse = function (courseData) {
    return new Promise((resolve, reject) => {
        for (let prop in courseData) {
            if (courseData[prop] === "") {
                courseData[prop] = null;
            }
        }
        Course.update(courseData, { where: { courseId: courseData.courseId } })
            .then(() => resolve("Course updated successfully"))
            .catch(err => reject("Unable to update course"));
    });
};

module.exports.deleteCourseById = function (id) {
    return new Promise((resolve, reject) => {
        Course.destroy({ where: { courseId: id } })
            .then(() => resolve("Course deleted successfully"))
            .catch(err => reject("Unable to delete course"));
    });
};

module.exports.deleteStudentByNum = function (studentNum) {
    return new Promise((resolve, reject) => {
        Student.destroy({ where: { studentNum: studentNum } })
            .then(deleted => {
                if (deleted) {
                    resolve(`Student ${studentNum} deleted.`);
                } else {
                    reject(`Student ${studentNum} not found.`);
                }
            })
            .catch(err => {
                reject(`Error deleting student: ${err}`);
            });
    });
};
