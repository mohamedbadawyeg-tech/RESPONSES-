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
