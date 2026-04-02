const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session=require("express-session");

app.use(session({   //Use express-session as middleware for every request in my app
    secret:"secret-key", //Acts like a password for sessions
    resave:false,   //Don’t rewrite the same session again and again unless something actually changed.
    saveUninitialized: false    //Don’t create a session until we actually store something in it (like after login)
}));

// ✅ MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

// ✅ HOME
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/home_page.html");
});

// ✅ CONNECT DB
mongoose.connect("mongodb://127.0.0.1:27017/users_goal")
.then(() => console.log("connected"))
.catch(err => console.log(err));

// ✅ SCHEMA
const schema = new mongoose.Schema({
    add_task: String,
    userID: String
});

// ✅ MODEL
const Task = mongoose.model("Task", schema);

// ================= ADD =================
app.post("/add_task", async (req, res) => {
    try {
        const taskText = req.body.add_task;

        if (!taskText || taskText.trim() === "") {
            return res.status(400).json({ success: false });
        }

        const new_task = new Task({
             add_task: req.body.add_task,
             userID:req.session.userID  //LINK TASK TO USER
            
            });
        await new_task.save();

        res.status(201).json(new_task);

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
});


app.get("/get-tasks", async(req,res) => {
    if(!req.session.userID){
        return res.status(401).json([]);
    }
    const tasks=await Task.find({userID: req.session.userID});
    res.json(tasks);
});
// ================= DELETE =================
app.delete("/delete_task/:id", async (req, res) => {
    try {
        console.log("Delete request ID:", req.params.id); // ✅ debug

        const deleted = await Task.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ success: false });
        }

        res.json({ success: true });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
});

// ================= UPDATE =================
app.put("/update_task/:id", async (req, res) => {
    try {
        const updated = await Task.findByIdAndUpdate(
            req.params.id,
            { add_task: req.body.add_task },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false });
        }

        res.json({ success: true });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
});
//PROTECT HOMEPAGE
app.get("/HOME_PAGE/home_page.html", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/");
    }
    res.sendFile(__dirname + "/HOME_PAGE/home_page.html");
});

// ================= SERVER =================
app.listen(3000, () => {
    console.log("SERVER RUNNING ON PORT 3000");
});