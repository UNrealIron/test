function checkClientEligibility(jsonData) {
  const client = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData; //парсинг данных заёмщика
  
  // 1.
  const now = new Date();
  const birthDate = new Date(client.birthDate); //подтягивание из файла даты рождения заёмщика
  let age = now.getFullYear() - birthDate.getFullYear(); //вычисление года
  const m = now.getMonth() - birthDate.getMonth(); //месяца
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 20) return false; //если меньшн 20 то отказ 
  
  // 2.
  const passportDate = new Date(client.passport.issuedAt);
  const birthDateObj = new Date(client.birthDate);

  // вычисление 20 ти летия
  const date20 = new Date(birthDateObj);
  date20.setFullYear(date20.getFullYear() + 20);

  // вычисление 45 ти летия
  const date45 = new Date(birthDateObj);
  date45.setFullYear(date45.getFullYear() + 45);

  if (age > 20 && passportDate < date20) return false;

  if (age > 45 && passportDate < date45) return false;
  
  // 3.
  const creditHistory = client.creditHistory;
  let nonCardOverdueCount = 0;
  
  for (const credit of creditHistory) {
    // если есть просроченная задолженность - отказ
    if (credit.currentOverdueDebt > 0) {
      return false;
    }
    
    //  другие типы кредита
    if (credit.type !== "Кредитная карта") {
      if (credit.numberOfDaysOnOverdue > 60) return false;
      if (credit.numberOfDaysOnOverdue > 15) nonCardOverdueCount++;
    } else { // для "Кредитная карта"
      if (credit.numberOfDaysOnOverdue > 30) return false;
    }
  }
  
  // если более двух кредитов не "Кредитная карта" имели просрочку более 15 дней – отказ
  if (nonCardOverdueCount > 2) return false;
  
  // если всё хорошо - всё пройдено!
  return true;
}

// Пример тестовых данных
const testJson1 = `{
  "firstName": "Иван",
  "middleName": "Иванович",
  "lastName": "Иванов",
  "birthDate": "1969-12-31T21:00:00.000Z",
  "citizenship": "РФ",
  "passport": {
    "series": "12 34",
    "number": "123456",
    "issuedAt": "2023-03-11T21:00:00.000Z",
    "issuer": "УФМС",
    "issuerСode": "123-456"
  },
  "creditHistory": [
    {
      "type": "Кредит наличными",
      "currency": "RUB",
      "issuedAt": "2003-02-27T21:00:00.000Z",
      "rate": 0.13,
      "loanSum": 100000,
      "term": 12,
      "repaidAt": "2004-02-27T21:00:00.000Z",
      "currentOverdueDebt": 0,
      "numberOfDaysOnOverdue": 0,
      "remainingDebt": 0,
      "creditId": "25e8a350-fbbc-11ee-a951-0242ac120002"
    },
    {
      "type": "Кредитная карта",
      "currency": "RUB",
      "issuedAt": "2009-03-27T21:00:00.000Z",
      "rate": 0.24,
      "loanSum": 30000,
      "term": 3,
      "repaidAt": "2009-06-29T20:00:00.000Z",
      "currentOverdueDebt": 0,
      "numberOfDaysOnOverdue": 2,
      "remainingDebt": 0,
      "creditId": "81fb1ff6-fbbc-11ee-a951-0242ac120002"
    },
    {
      "type": "Кредит наличными",
      "currency": "RUB",
      "issuedAt": "2009-02-27T21:00:00.000Z",
      "rate": 0.09,
      "loanSum": 200000,
      "term": 24,
      "repaidAt": "2011-03-02T21:00:00.000Z",
      "currentOverdueDebt": 0,
      "numberOfDaysOnOverdue": 3,
      "remainingDebt": 0,
      "creditId": "c384eea2-fbbc-11ee-a951-0242ac120002"
    },
    {
      "type": "Кредитная наличными",
      "currency": "RUB",
      "issuedAt": "2024-05-15T21:00:00.000Z",
      "rate": 0.13,
      "loanSum": 200000,
      "term": 36,
      "repaidAt": null,
      "currentOverdueDebt": 10379,
      "numberOfDaysOnOverdue": 15,
      "remainingDebt": 110000,
      "creditId": "ebeddfde-fbbc-11ee-a951-0242ac120002"
    }
  ]
}`;

// Заёмщик родился в 2007 году, значит, ему меньше 20 лет
const testJson2 = `{ 
  "firstName": "Алексей",
  "middleName": "Петрович",
  "lastName": "Сидоров",
  "birthDate": "2007-05-15T00:00:00.000Z",
  "citizenship": "РФ",
  "passport": {
    "series": "56 78",
    "number": "987654",
    "issuedAt": "2025-01-01T00:00:00.000Z",
    "issuer": "УФМС",
    "issuerСode": "987-654"
  },
  "creditHistory": []
}`;

// Паспорт выдан в 2008 году, то есть до достижения 20 лет, что приводит к отказу.
const testJson3 = `{
"firstName": "Мария",
"middleName": "Алексеевна",
"lastName": "Иванова",
"birthDate": "1990-01-01T00:00:00.000Z",
"citizenship": "РФ",
"passport": {
  "series": "11 22",
  "number": "334455",
  "issuedAt": "2008-12-31T00:00:00.000Z", 
  "issuer": "УФМС",
  "issuerСode": "111-222"
},
"creditHistory": []
}`;


const testJson4 = `{
  "firstName": "Петр",
  "middleName": "Сергеевич",
  "lastName": "Лукин",
  "birthDate": "1980-06-15T00:00:00.000Z",
  "citizenship": "РФ",
  "passport": {
    "series": "10 20",
    "number": "556677",
    "issuedAt": "2005-07-01T00:00:00.000Z",
    "issuer": "УФМС",
    "issuerСode": "101-202"
  },
  "creditHistory": [
    {
      "type": "Кредит наличными",
      "currency": "RUB",
      "issuedAt": "2010-01-01T00:00:00.000Z",
      "rate": 0.1,
      "loanSum": 50000,
      "term": 12,
      "repaidAt": "2011-01-01T00:00:00.000Z",
      "currentOverdueDebt": 0,
      "numberOfDaysOnOverdue": 10,
      "remainingDebt": 0,
      "creditId": "666e8a350-fbbc-11ee-a951-0242ac120002"
    },
    {
      "type": "Кредитная карта",
      "currency": "RUB",
      "issuedAt": "2012-03-01T00:00:00.000Z",
      "rate": 0.2,
      "loanSum": 30000,
      "term": 6,
      "repaidAt": "2012-09-01T00:00:00.000Z",
      "currentOverdueDebt": 0,
      "numberOfDaysOnOverdue": 5,
      "remainingDebt": 0,
      "creditId": "777e8a350-fbbc-11ee-a951-0242ac120002"
    }
  ]
}`;

// Просрочка более 60 дней для кредита, не являющегося "Кредитной картой"
const testJson5 = `{
"firstName": "Светлана",
"middleName": "Михайловна",
"lastName": "Кузнецова",
"birthDate": "1985-06-15T00:00:00.000Z",
"citizenship": "РФ",
"passport": {
  "series": "55 66",
  "number": "112233",
  "issuedAt": "2010-07-01T00:00:00.000Z",
  "issuer": "УФМС",
  "issuerСode": "555-666"
},
"creditHistory": [
  {
    "type": "Кредит наличными",
    "currency": "RUB",
    "issuedAt": "2015-02-01T00:00:00.000Z",
    "rate": 0.1,
    "loanSum": 50000,
    "term": 12,
    "repaidAt": "2016-02-01T00:00:00.000Z",
    "currentOverdueDebt": 0,
    "numberOfDaysOnOverdue": 70,
    "remainingDebt": 0,
    "creditId": "111e8a350-fbbc-11ee-a951-0242ac120002"
  }
]
}`;

console.log(checkClientEligibility(testJson1));
console.log(checkClientEligibility(testJson2));
console.log(checkClientEligibility(testJson3));
console.log(checkClientEligibility(testJson4));
console.log(checkClientEligibility(testJson5));