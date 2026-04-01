const express = require("express");
const app = express();
const mongoose = require("mongoose");

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
    add_task: {
        type: String,
        required: true
    }
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

        const new_task = new Task({ add_task: taskText });
        await new_task.save();

        res.status(201).json(new_task);

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
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

// ================= SERVER =================
app.listen(3000, () => {
    console.log("SERVER RUNNING ON PORT 3000");
});