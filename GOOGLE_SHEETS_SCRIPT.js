// INSTRUCTIONS:
// 1. Go to https://script.google.com/home
// 2. Click "New Project"
// 3. Delete any code in the editor and paste this entire script
// 4. Click "Deploy" > "New deployment"
// 5. Select type: "Web app"
// 6. Description: "Employee Portal API"
// 7. Execute as: "Me" (your email)
// 8. Who has access: "Anyone" (IMPORTANT!)
// 9. Click "Deploy", then "Authorize access" (Review permissions > Go to (unsafe))
// 10. Copy the "Web App URL" and paste it into your App.tsx file

var SCRIPT_PROP = PropertiesService.getScriptProperties();

function setup() {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  SCRIPT_PROP.setProperty("key", doc.getId());
}

function doPost(e) {
  return handleResponse(e);
}

function doGet(e) {
  return handleResponse(e);
}

function handleResponse(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);  // wait 30 seconds before conceding defeat.
  
  try {
    var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
    var sheet = doc.getSheetByName("Responses");
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = doc.insertSheet("Responses");
      var headers = [
        "id", "timestamp", "employeeName", "nationalId", "mobileNumber", "jobTitle", "location", "reviewDate",
        "leadership", "planning", "technical", "development", "analytical", "innovation", "control",
        "problemSolving", "communication", "behavior", "adaptability", "relationships", "unexpectedEvents", "equalOpportunity",
        "improvementAreas", "plannedActions", "trainingActivities", "promotionPotential", "currentCapabilities", "employeeComments"
      ];
      sheet.appendRow(headers);
    }

    // Handle GET (Fetch Data)
    if (e.parameter.action === "read") {
      var rows = sheet.getDataRange().getValues();
      var headers = rows[0];
      var data = [];
      
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var record = {};
        for (var j = 0; j < headers.length; j++) {
          record[headers[j]] = row[j];
        }
        data.push(record);
      }
      
      return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Handle POST (Save Data)
    var postData = JSON.parse(e.postData.contents);
    
    // Map the incoming data to the columns order
    var nextRow = [
      postData.id || new Date().getTime().toString(),
      new Date(),
      postData.employeeName,
      postData.jobTitle,
      postData.location,
      postData.reviewDate,
      postData.ratings?.leadership,
      postData.ratings?.planning,
      postData.ratings?.technical,
      postData.ratings?.development,
      postData.ratings?.analytical,
      postData.ratings?.innovation,
      postData.ratings?.control,
      postData.ratings?.problemSolving,
      postData.ratings?.communication,
      postData.ratings?.behavior,
      postData.ratings?.adaptability,
      postData.ratings?.relationships,
      postData.ratings?.unexpectedEvents,
      postData.ratings?.equalOpportunity,
      postData.improvementAreas,
      postData.plannedActions,
      postData.trainingActivities,
      postData.promotionPotential,
      postData.currentCapabilities,
      postData.employeeComments
    ];
    
    sheet.appendRow(nextRow);
    
    return ContentService
      .createTextOutput(JSON.stringify({"result":"success", "row": nextRow}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({"result":"error", "error": e}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Helper to run once manually to link script to sheet
function initialSetup() {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  SCRIPT_PROP.setProperty("key", doc.getId());
}

/**
 * ------------------------------------------------------------------
 * DASHBOARD & VISUALIZATION FEATURES
 * ------------------------------------------------------------------
 * This section adds a menu to your Google Sheet to generate charts automatically.
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Employee Portal Admin')
      .addItem('📊 Update Dashboard Charts', 'createDashboard')
      .addToUi();
}

function createDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var responsesSheet = ss.getSheetByName("Responses");
  
  if (!responsesSheet) {
    SpreadsheetApp.getUi().alert("Error: 'Responses' sheet not found. Please submit at least one form first.");
    return;
  }

  // Create or get Dashboard sheet
  var dashboardSheet = ss.getSheetByName("Dashboard");
  if (!dashboardSheet) {
    dashboardSheet = ss.insertSheet("Dashboard");
  }
  dashboardSheet.clear(); // Clear old data/charts

  // Get all response data
  var data = responsesSheet.getDataRange().getValues();
  if (data.length < 2) {
    SpreadsheetApp.getUi().alert("Not enough data to generate charts.");
    return;
  }

  // --- CHART 1: Average Performance by Factor ---
  // Rating columns are from index 8 to 21 (14 columns)
  // leadership(8) ... equalOpportunity(21)
  
  var factors = [
    "Leadership", "Planning", "Technical", "Development", "Analytical", "Innovation", "Control",
    "Problem Solving", "Communication", "Behavior", "Adaptability", "Relationships", "Unexpected Events", "Equal Opportunity"
  ];
  
  var sums = new Array(factors.length).fill(0);
  var count = 0;

  // Calculate sums
  for (var i = 1; i < data.length; i++) {
    // Check if row has valid ratings (just checking first rating column)
    if (data[i][8] !== "") {
      for (var j = 0; j < factors.length; j++) {
        var val = parseFloat(data[i][8 + j]) || 0;
        sums[j] += val;
      }
      count++;
    }
  }

  // Prepare aggregated data for Chart 1
  dashboardSheet.getRange("A1").setValue("📊 Team Performance Analysis").setFontSize(14).setFontWeight("bold");
  dashboardSheet.getRange("A3").setValue("Performance Factor").setFontWeight("bold").setBackground("#f3f4f6");
  dashboardSheet.getRange("B3").setValue("Average Score (1-5)").setFontWeight("bold").setBackground("#f3f4f6");

  for (var k = 0; k < factors.length; k++) {
    var avg = count > 0 ? (sums[k] / count) : 0;
    dashboardSheet.getRange(k + 4, 1).setValue(factors[k]);
    dashboardSheet.getRange(k + 4, 2).setValue(avg);
  }

  // Create Column Chart
  var chart1 = dashboardSheet.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(dashboardSheet.getRange(3, 1, factors.length + 1, 2))
    .setPosition(2, 4, 0, 0) // Place at Row 2, Column E
    .setOption('title', 'Average Team Performance by Competency')
    .setOption('hAxis.title', 'Competency')
    .setOption('vAxis.title', 'Average Score')
    .setOption('colors', ['#4f46e5']) // Indigo color
    .build();
    
  dashboardSheet.insertChart(chart1);

  // --- CHART 2: Promotion Potential Distribution ---
  // Column Z (index 25)
  
  var promoCounts = {};
  for (var i = 1; i < data.length; i++) {
    var status = data[i][25];
    if (status) {
      promoCounts[status] = (promoCounts[status] || 0) + 1;
    }
  }

  var rowStart = factors.length + 8; // Leave some space
  dashboardSheet.getRange(rowStart, 1).setValue("📈 Promotion Readiness").setFontSize(14).setFontWeight("bold");
  dashboardSheet.getRange(rowStart + 2, 1).setValue("Status").setFontWeight("bold").setBackground("#f3f4f6");
  dashboardSheet.getRange(rowStart + 2, 2).setValue("Count").setFontWeight("bold").setBackground("#f3f4f6");

  var pIndex = 0;
  for (var key in promoCounts) {
    dashboardSheet.getRange(rowStart + 3 + pIndex, 1).setValue(key);
    dashboardSheet.getRange(rowStart + 3 + pIndex, 2).setValue(promoCounts[key]);
    pIndex++;
  }

  // Create Pie Chart
  if (pIndex > 0) {
    var chart2 = dashboardSheet.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(dashboardSheet.getRange(rowStart + 2, 1, pIndex + 1, 2))
      .setPosition(22, 4, 0, 0) // Place below first chart
      .setOption('title', 'Employee Promotion Readiness')
      .setOption('pieHole', 0.4) // Donut chart style
      .setOption('colors', ['#059669', '#d97706', '#dc2626']) // Emerald, Amber, Red
      .build();
      
    dashboardSheet.insertChart(chart2);
  }

  // --- CHART 3: Individual Employee Scores ---
  
  var empRowStart = rowStart + pIndex + 10; // Leave space after previous table
  dashboardSheet.getRange(empRowStart, 1).setValue("🏆 Individual Employee Scores").setFontSize(14).setFontWeight("bold");
  dashboardSheet.getRange(empRowStart + 2, 1).setValue("Employee Name").setFontWeight("bold").setBackground("#f3f4f6");
  dashboardSheet.getRange(empRowStart + 2, 2).setValue("Overall Score").setFontWeight("bold").setBackground("#f3f4f6");

  var empData = [];
  var detailedStats = []; // For the detailed breakdown chart

  for (var i = 1; i < data.length; i++) {
    var name = data[i][2]; // Employee Name is at index 2
    var totalScore = 0;
    var validRatings = 0;
    var empRatings = [name]; // Start with name for the row
    
    // Sum ratings from index 8 to 21
    for (var r = 8; r <= 21; r++) {
      var val = parseFloat(data[i][r]);
      if (!isNaN(val)) {
        totalScore += val;
        validRatings++;
        empRatings.push(val);
      } else {
        empRatings.push(0);
      }
    }
    
    var avgScore = validRatings > 0 ? (totalScore / validRatings) : 0;
    // Round to 2 decimal places
    avgScore = Math.round(avgScore * 100) / 100;
    
    if (name) {
        empData.push([name, avgScore]);
        detailedStats.push(empRatings);
    }
  }

  // Write data for Chart 3
  if (empData.length > 0) {
    dashboardSheet.getRange(empRowStart + 3, 1, empData.length, 2).setValues(empData);

    // Create Bar Chart (Horizontal bars)
    var chart3 = dashboardSheet.newChart()
      .setChartType(Charts.ChartType.BAR)
      .addRange(dashboardSheet.getRange(empRowStart + 2, 1, empData.length + 1, 2))
      .setPosition(42, 4, 0, 0) // Place further down
      .setOption('title', 'Overall Employee Performance')
      .setOption('hAxis.title', 'Average Score (1-5)')
      .setOption('vAxis.title', 'Employee')
      .setOption('colors', ['#7c3aed']) // Violet color
      .setOption('legend', {position: 'none'}) // Hide legend for cleaner look
      .build();
      
    dashboardSheet.insertChart(chart3);
  }

  // --- CHART 4: Detailed Competency Breakdown (Stacked or Grouped) ---
  
  var detailedRowStart = empRowStart + empData.length + 25; // More space down
  dashboardSheet.getRange(detailedRowStart, 1).setValue("📊 Detailed Competency Analysis").setFontSize(14).setFontWeight("bold");
  
  // Headers for detailed stats
  var detailedHeaders = ["Employee Name"].concat(factors);
  dashboardSheet.getRange(detailedRowStart + 2, 1, 1, detailedHeaders.length)
    .setValues([detailedHeaders])
    .setFontWeight("bold")
    .setBackground("#f3f4f6");

  // Write detailed data
  if (detailedStats.length > 0) {
    dashboardSheet.getRange(detailedRowStart + 3, 1, detailedStats.length, detailedHeaders.length).setValues(detailedStats);

    // Create Column Chart (Grouped by Employee)
    var chart4 = dashboardSheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(dashboardSheet.getRange(detailedRowStart + 2, 1, detailedStats.length + 1, detailedHeaders.length))
      .setPosition(detailedRowStart - 1, 18, 0, 0) // Place to the right of the data (Column R)
      .setOption('title', 'Detailed Competency Scores per Employee')
      .setOption('hAxis.title', 'Employee')
      .setOption('vAxis.title', 'Score')
      .setOption('isStacked', false) // Side-by-side bars for comparison
      .setOption('width', 800)
      .setOption('height', 400)
      .build();
      
    dashboardSheet.insertChart(chart4);
  }

  // --- TABLE: Qualitative Data (Improvement, Actions, Training, Promotion, Capabilities) ---
  
  var textRowStart = detailedRowStart + detailedStats.length + 5;
  dashboardSheet.getRange(textRowStart, 1).setValue("📝 Development & Promotion Plan").setFontSize(14).setFontWeight("bold");
  
  var textHeaders = [
    "Employee Name", 
    "Promotion Potential", 
    "Current Capabilities", 
    "Improvement Areas", 
    "Planned Actions", 
    "Training Activities"
  ];

  dashboardSheet.getRange(textRowStart + 2, 1, 1, textHeaders.length)
    .setValues([textHeaders])
    .setFontWeight("bold")
    .setBackground("#f3f4f6")
    .setFontColor("#1f2937");

  var textData = [];
  for (var i = 1; i < data.length; i++) {
    var name = data[i][2];
    if (name) {
      textData.push([
        name,
        data[i][25], // promotionPotential
        data[i][26], // currentCapabilities
        data[i][22], // improvementAreas
        data[i][23], // plannedActions
        data[i][24]  // trainingActivities
      ]);
    }
  }

  if (textData.length > 0) {
    var range = dashboardSheet.getRange(textRowStart + 3, 1, textData.length, textHeaders.length);
    range.setValues(textData);
    range.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP); // Wrap text for readability
    range.setVerticalAlignment("top");
    
    // Auto-resize columns for better view
    dashboardSheet.setColumnWidth(1, 150); // Name
    dashboardSheet.setColumnWidth(2, 150); // Promotion
    dashboardSheet.setColumnWidth(3, 150); // Capabilities
    dashboardSheet.setColumnWidth(4, 300); // Improvement
    dashboardSheet.setColumnWidth(5, 300); // Actions
    dashboardSheet.setColumnWidth(6, 300); // Training
  }

  SpreadsheetApp.getUi().alert("Dashboard updated successfully!");
}
