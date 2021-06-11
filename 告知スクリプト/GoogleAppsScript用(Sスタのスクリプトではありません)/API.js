const VersionType = {
  MAJOR: 0,
  MINOR: 1,
  PATCH: 2,
  UNKNOWN: 3
};

const CompareValueType = {
  EQUAL: 0,
  FIRST_HIGHER: 1,
  SECOND_HIGHER: 2
};

const doGet = (query) => {
  const responseData = {
    notice: "",
    error: ""
  };
  const output = ContentService.createTextOutput();

  try {
    validationSpreadSheetId(query);
    validationVersion(query);
    const noticeInfos = getNoticeInfos(query.parameter.spreadSheetId);
    validationNoticeInfos(noticeInfos);
    const newGameVersion = noticeInfos[0][0].split('.').map(x => parseInt(x));
    const requestGameVersion = [
      parseInt(query.parameter.major),
      parseInt(query.parameter.minor),
      parseInt(query.parameter.patch)
    ];
    
    if (isOldRequestVersion(newGameVersion, requestGameVersion)) {
      if (typeof noticeInfos[0][1] === 'string') {
        responseData.notice = noticeInfos[0][1];
      }
    } else {
      responseData.notice = "更新情報はありません。";
    }
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(JSON.stringify(responseData));

    return output;
  } catch (error) {
    responseData.error = error;
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(JSON.stringify(responseData));

    return output;
  }
};

const validationSpreadSheetId = (query) => {
  if (typeof query.parameter.spreadSheetId === 'string') {
    return;
  }
  throw("spreadSheetId is not string.");
};

const validationVersion = (query) => {
  let errText = "";
  if (typeof query.parameter.major !== 'string') {
    errText += "major is not string.";
  }
  if (typeof query.parameter.minor !== 'string') {
    errText += "minor is not string.";
  }
  if (typeof query.parameter.patch !== 'string') {
    errText += "patch is not string.";
  }
  if (errText) {
    throw(errText);
  }
  return;
};

const validationNoticeInfos = (noticeInfos) => {
  if (!Array.isArray(noticeInfos)) {
    throw("spreadSheet error.");
  }
  if (noticeInfos[0].length < 1) {
    throw("spreadSheet is needs A1 and A2.");
  }
  if (typeof noticeInfos[0][0] !== 'string') {
    throw("spreadSheet A1 is not string.'");
  }
  if (typeof noticeInfos[0][1] !== 'string') {
    throw("spreadSheet A2 is not string.");
  }
  if (noticeInfos[0][0].split('.').length !== 3) {
    throw("spreadSheet A1 needs 'X.Y.Z'.");
  }
  return;
};

const isOldRequestVersion = (newGameVersion, requestGameVersion, versionType = VersionType.MAJOR) => {
  if (versionType >= VersionType.UNKNOWN) {
    return false;
  }
  const compareValueType = compareValue(newGameVersion[versionType],requestGameVersion[versionType]);
  if (compareValueType === CompareValueType.EQUAL) {
    return isOldRequestVersion(newGameVersion, requestGameVersion, versionType + 1);
  } else if (compareValueType === CompareValueType.SECOND_HIGHER) {
    return false;
  } else {
    return true;
  }
};

const compareValue = (a, b) => {
  if (a < b) {
    return CompareValueType.SECOND_HIGHER;
  }
  else if (a === b) {
    return CompareValueType.EQUAL;
  }
  else {
    return CompareValueType.FIRST_HIGHER;
  }
};

const getNoticeInfos = (spreadSheetId) => {
  return SpreadsheetApp.openById(spreadSheetId).getSheets()[0].getRange(1,1,1,2).getValues();
};