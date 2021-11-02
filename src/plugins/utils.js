export function TokenValidation(token) {
  if (!token || token.split(".").length < 3) {
    return false;
  }
  let data = JSON.parse(atob(token.split(".")[1]));
  let exp = new Date(data.exp * 1000);
  let now = new Date();
  return now < exp;
}

/*export function eventsParser(events) {
  let result = [];

}*/

export function StatusDecoder(status) {
  let decoded = status.toString(2).split("").reverse();
  let result = 0;
  // линия работает
  if (Number(decoded[1]) && Number(decoded[21])) {
    result = result | 1;
  }
  // данные загружены
  if (Number(decoded[0]) && Number(decoded[20])) {
    result = result | 2;
  }
  // данные загружены, линия стоит
  if (
    Number(decoded[0]) &&
    !Number(decoded[1]) &&
    Number(decoded[20]) &&
    !Number(decoded[21])
  ) {
    result = result | 4;
  }
  // память 75
  if (Number(decoded[4]) || Number(decoded[24])) {
    result = result | 8;
  }
  // память 99
  if (Number(decoded[5]) || Number(decoded[25])) {
    result = result | 16;
  }
  // авария
  if (Number(decoded[6]) || Number(decoded[26])) {
    result = result | 32;
  }
  // была авария
  if (
    Number(decoded[8]) ||
    Number(decoded[28]) ||
    Number(decoded[9]) ||
    Number(decoded[29])
  ) {
    result = result | 64;
  }
  // пониженная производительность
  if (Number(decoded[10]) || Number(decoded[30])) {
    result = result | 128;
  }
  // простой 5
  if (Number(decoded[11]) && Number(decoded[31])) {
    result = result | 256;
  }
  // простой 15
  if (Number(decoded[12]) && Number(decoded[32])) {
    result = result | 512;
  }
  // получение данных
  if (Number(decoded[16]) || Number(decoded[36])) {
    result = result | 1024;
  }
  if (Number(decoded[15]) && Number(decoded[35])) {
    result = result | 2048;
  }
  return result;
}

export function AccidentStatus(accidents) {
  for (let i = 0; i < accidents.length; i++) {
    if (accidents[i].message === "") {
      return true;
    }
  }
  return false;
}

export function GetDots(plot_last, axe) {
  let result = [];
  for (let j = 0; j < plot_last.length; j++) {
    result.push(plot_last[j][axe]);
  }
  return result;
}

export function EventsDecoder(events) {
  let decoded = [];
  let key = new Date(parseInt(Object.keys(events)[0]));
  let value = Object.values(events)[0];
  let event_type = Object.keys(value);
  let event_value = Object.values(value);
  for (let i = 0; i < event_type.length; i++) {
    let decoded_object = {};
    let object_key = "";
    let object_value = "";
    switch (event_type[i]) {
      case "1":
        object_key = new Date(parseInt(Object.keys(event_value[i])[0]));
        object_value = new Date(Object.values(event_value[i])[0]);
        decoded_object.type = "Авария датчика";
        decoded_object.description =
          "Начало аварии --- " +
          object_key +
          ", конец аварии --- " +
          object_value;
        decoded_object.date = key;
        break;
      case "2":
        object_key = new Date(parseInt(Object.keys(event_value[i])[0]));
        object_value = new Date(Object.values(event_value[i])[0]);
        decoded_object.type = "Ошибка";
        decoded_object.description =
          "Начало ошибки --- " +
          object_key +
          ", конец ошибки --- " +
          object_value;
        decoded_object.date = key;
        break;
      case "3":
        object_key = new Date(parseInt(Object.keys(event_value[i])[0]));
        object_value = new Date(Object.values(event_value[i])[0]);
        decoded_object.type = "Отсутствие питания";
        decoded_object.description =
          "Начало --- " + object_key + ", конец --- " + object_value;
        decoded_object.date = key;
        break;
      case "4":
        object_key = new Date(parseInt(Object.keys(event_value[i])[0]));
        object_value = new Date(Object.values(event_value[i])[0]);
        decoded_object.type = "Коррекция времени";
        decoded_object.description =
          "Старое время --- " +
          object_key +
          ", установленное время --- " +
          object_value;
        decoded_object.date = key;
        break;
      case "5":
        decoded_object.type = "Неизвестный тип";
        decoded_object.description = "Неизвестно";
        decoded_object.date = key;
        break;
      case "7":
        object_key = new Date(parseInt(Object.keys(event_value[i])[0]));
        object_value = Object.values(event_value[i])[0];
        decoded_object.type = "Задание на розлив";
        decoded_object.description =
          "Начало --- " +
          object_key +
          ", завершено --- " +
          new Date(object_value.job_end) +
          "\n Сквозной --- " +
          object_value.total_counter +
          "\n Уставка --- " +
          object_value.sp +
          "\n Насчитано в розливе --- " +
          object_value.pv +
          "\n Насчитано без марок --- " +
          object_value.pv_0 +
          "\n Насчитано без задания --- " +
          object_value.pv_1 +
          "\n Продукция --- " +
          object_value.pdc +
          "\n Тара --- " +
          object_value.pkc +
          "\n Объем --- " +
          object_value.vlc +
          "\n Тип марки --- " +
          object_value.txc +
          "\n Марки --- ";
        decoded_object.date = key;
        break;
      default:
        decoded_object.type = "Неизвестный тип";
        decoded_object.description = "Неизвестно";
        decoded_object.date = key;
    }
    decoded.push(decoded_object);
  }
  return decoded;
}
