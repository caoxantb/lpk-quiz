const migrateDatav1_1_1 = () => {
  try {
    const currentVersion = JSON.parse(
      localStorage.getItem("version") || "null"
    );

    // 🔒 Only run migration if version is missing or not "1.1.1"
    if (currentVersion === "1.1.1") {
      console.log(
        "✅ LocalStorage already up-to-date (1.1.1). No migration needed."
      );
      return;
    }

    console.log("⚙️ Running migration to version 1.1.1...");

    // 1️⃣ Get the "test" data
    const savedTest = localStorage.getItem("test");
    if (savedTest) {
      const parsed = JSON.parse(savedTest);
      let modified = false;

      // Loop through each test[id]
      for (const key in parsed) {
        if (typeof parsed[key] !== "object" || parsed[key] === null) continue;
        const entry = parsed[key];

        // Add session1PauseSequences if missing
        if (!("session1PauseSequences" in entry)) {
          entry.session1PauseSequences = [];
          modified = true;
        }

        // Add session2PauseSequences if missing
        if (!("session2PauseSequences" in entry)) {
          entry.session2PauseSequences = [];
          modified = true;
        }
      }

      // Save updated test data if changed
      if (modified) {
        localStorage.setItem("test", JSON.stringify(parsed));
        console.log("✅ Updated test data with new timestamp fields.");
      }
    }

    // 2️⃣ Remove "questions" key
    if (localStorage.getItem("questions")) {
      localStorage.removeItem("questions");
      console.log("🗑️ Removed deprecated 'questions' key.");
    }

    // 3️⃣ Set or update "version" key to "1.1.1"
    localStorage.setItem("version", JSON.stringify("1.1.1"));
    console.log("✅ Migration complete. Version set to 1.1.1.");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  }
};

export const migrateData = {
  "1.1.1": migrateDatav1_1_1,
};
