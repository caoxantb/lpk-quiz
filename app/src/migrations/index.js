const migrateDatav1_1_0 = () => {
  try {
    const currentVersion = JSON.parse(
      localStorage.getItem("version") || "null"
    );

    // 🔒 Only run migration if version is missing or not "1.1.0"
    if (currentVersion === "1.1.0") {
      console.log(
        "✅ LocalStorage already up-to-date (1.1.0). No migration needed."
      );
      return;
    }

    console.log("⚙️ Running migration to version 1.1.0...");

    // 1️⃣ Get the "test" data
    const savedTest = localStorage.getItem("test");
    if (savedTest) {
      const parsed = JSON.parse(savedTest);
      let modified = false;

      // Loop through each test[id]
      for (const key in parsed) {
        if (typeof parsed[key] !== "object" || parsed[key] === null) continue;
        const entry = parsed[key];

        // Add session1EndTimestamp if missing
        if (!("session1EndTimestamp" in entry)) {
          entry.session1EndTimestamp = [];
          modified = true;
        }

        // Add session2EndTimestamp if missing
        if (!("session2EndTimestamp" in entry)) {
          entry.session2EndTimestamp = [];
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

    // 3️⃣ Set or update "version" key to "1.1.0"
    localStorage.setItem("version", JSON.stringify("1.1.0"));
    console.log("✅ Migration complete. Version set to 1.1.0.");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  }
};

export const migrateData = {
  "1.1.0": migrateDatav1_1_0,
};
