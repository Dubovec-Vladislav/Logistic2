// Функция для расчета количества ездок в последний пункт
function calculateTrips(cars, points) {
  const lastPoint = points[points.length - 1];
  let i = 0;
  let counter = 0;
  while (lastPoint.ОставшаясяПотребность > 0) {
    lastPoint.ОставшаясяПотребность -= cars[i].РеальнаяГрузоподъемность;
    lastPoint.ОставшаясяПотребность = Number(lastPoint.ОставшаясяПотребность.toFixed(3));
    counter++;
    i = i < cars.length - 1 ? ++i : 0;
  }
  lastPoint.ОставшаясяПотребность = 0;
  lastPoint['КоличествоЕздок'] = counter;
  return lastPoint;
}

// Функция для создания полей ввода для точек
function createPointInputs() {
  const pointCount = document.getElementById('pointCount').value;
  let inputsHtml = '';

  for (let i = 0; i < pointCount; i++) {
    inputsHtml += `
    <div class="main__form-row">
      <div class="main__form-field">
        <div class="main__form-label">Точка ${i + 1}</div>
        <div class="main__form-field-inputs">
          <input value="10" class="main__form-field-input" type="number" id="depotDistance${i}" min="1" placeholder="Расстояние от депо">
          <input value="10" class="main__form-field-input" type="number" id="careerDistance${i}" min="1" placeholder="Расстояние от карьера">
          <input value="30" class="main__form-field-input" type="number" id="needs${i}" min="1" placeholder="Потребность в тоннах груза">
        </div>
      </div>
    </div>
    `;
  }

  document.getElementById('pointInputs').innerHTML = inputsHtml;

  // const depotToCareerDistance = 6; // Расстояние от депо до карьера
  // const depotToPointsDistances = [10, 8, 13]; // Расстояния от депо до каждой точки
  // const careerToPointsDistances = [18, 12, 7]; // Расстояния от карьера до каждой точки
  // const needs = [30, 40, 50]; // Потребности для каждой точки
}

// Функция для создания полей ввода для машин
function createCarsInputs() {
  const carCount = document.getElementById('carCount').value;
  let inputsHtml = '';

  for (let i = 0; i < carCount; i++) {
    inputsHtml += `
    <div class="main__form-row">
      <div class="main__form-field">
        <div class="main__form-label">Машина ${i + 1}</div>
        <div class="main__form-field-inputs">
          <input value="6" class="main__form-field-input" type="number" id="carryingList${i}" min="1" placeholder="Введите грузоподъемность">
          <input value="0" class="main__form-field-input" type="number" id="loadFactor${i}" min="1" placeholder="Введите коэффициента для минимальной загрузки">
        </div>
      </div>
    </div>
    `;
  }

  document.getElementById('carsInputs').innerHTML = inputsHtml;
}

// Функция для получения отсортированного списка очередности объезда
function getSortedQueueList(pointsInfo) {
  return Object.fromEntries(
    pointsInfo
      .map((point, index) => ({ key: `Point${index + 1}`, value: point.depotTo - point.careerTo }))
      .sort((a, b) => b.value - a.value)
      .map((entry, index) => [entry.key, index + 1])
  );
}

// Функция для смены первого и последнего пункта маршрута местами
function swapFirstRouteKeyValue(cars) {
  cars.forEach((car) => {
    if (Object.keys(car.Маршрут).length !== 0) {
      const route = car.Маршрут;
      const keys = Object.keys(route);
      const values = Object.values(route);

      // Меняем местами первый и последний ключ
      [keys[0], keys[keys.length - 1]] = [keys[keys.length - 1], keys[0]];
      // Меняем местами первое и последнее значение
      [values[0], values[values.length - 1]] = [values[values.length - 1], values[0]];

      // Обновляем поле "Маршрут" в объекте
      car.Маршрут = keys.reduce((acc, key, index) => {
        acc[key] = values[index];
        return acc;
      }, {});
    } // Проверяем есть ли что-то в маршруте
  });
}

// ---- Планирование последних поездок и возвращения в депо ---- //

// Функция для расчета времени и пробега до последней точки
function calculateTimeAndMileageToLastPoint(lastPoint, transport, numberOfTrips) {
  let time = 0;
  let mileage = 0;
  const route = {};

  for (let i = 0; i < numberOfTrips; i++) {
    const isLastTrip = i === numberOfTrips - 1;
    const distanceToCareer = lastPoint.РасстояниеОтКарьераДоЭтойТочки;
    const distanceToDepot = lastPoint.РасстояниеОтДепоДоЭтойТочки;

    time += isLastTrip
      ? (distanceToCareer + distanceToDepot) / transport.speed + transport.loadingAndUnloadingTime
      : (distanceToCareer * 2) / transport.speed + transport.loadingAndUnloadingTime;
    mileage += isLastTrip ? distanceToCareer + distanceToDepot : distanceToCareer * 2;

    route[lastPoint.Название] = i + 1;
  }

  return { time, mileage, route };
}

// Функция для обновления данных по каждому автомобилю
function updateCarData(cars, lastPoint, time, mileage, route) {
  for (let i = 0; i < lastPoint.КоличествоЕздок; i++) {
    if (i > cars.length - 1) break;
    cars[i].ОставшеесяВремяРаботы -= time;
    cars[i].Пробег += mileage;
    cars[i].Маршрут = { ...route };
  }
}

// Функция для обновления данных по последней точке
function updateLastPointData(lastPoint, numberOfTrips, cars) {
  lastPoint.КоличествоЕздок = Math.max(0, lastPoint.КоличествоЕздок - numberOfTrips * cars.length);
  console.log(lastPoint.КоличествоЕздок);
  for (let i = 0; i < lastPoint.КоличествоЕздок; i++) {
    if (i > cars.length - 1) break;
    lastPoint.ОставшаясяПотребность += cars[i].РеальнаяГрузоподъемность;
  }
}

// Главная функция для планирование последних поездок и возвращения в депо
function planLastTripsAndReturn(cars, points, transport) {
  const lastPoint = calculateTrips(cars, points);
  const numberOfTripsToLastPoint = cars.length === points.length ? Math.floor(lastPoint.КоличествоЕздок / cars.length) || 1 : 1;
  const { time, mileage, route } = calculateTimeAndMileageToLastPoint(lastPoint, transport, numberOfTripsToLastPoint);
  updateCarData(cars, lastPoint, time, mileage, route);
  updateLastPointData(lastPoint, numberOfTripsToLastPoint, cars);
  points[points.length - 1] = lastPoint;
}
// ------------------------------------------------------------- //

// ------- Планирование других маршрутов для автомобилей ------- //
function planOtherRoutes(cars, points, transport) {
  for (const point of points) {
    for (const car of cars) {
      let tripCounter = car.Маршрут[point.Название] ? car.Маршрут[point.Название] : 0; // Если у нас уже были ездки на этой машине в этот пункт,
      //  то счетчик начинается с их количества (а не с 0)
      while (point.ОставшаясяПотребность > car.МинимальнаяЗагрузка && point.ОставшаясяПотребность !== 0 && car.ОставшеесяВремяРаботы > 0) {
        tripCounter += 1;
        const mileage = point['РасстояниеОтКарьераДоЭтойТочки'] * 2;
        const time = mileage / transport.speed + transport.loadingAndUnloadingTime;

        if (car.ОставшеесяВремяРаботы - time > 0) {
          car.ОставшеесяВремяРаботы -= time;
          car.Пробег += mileage;
          car.Маршрут[point.Название] = tripCounter;
          point.ОставшаясяПотребность = Math.max(0, Number((point.ОставшаясяПотребность - car.РеальнаяГрузоподъемность).toFixed(3)));
        } else break;
      }
    }
  }
}
// ------------------------------------------------------------- //

// ------------ Расчет общего % доставленных грузов ------------ //
function calculateCompletionPercentage(points, pointsInfo) {
  const fulfilledNeed = points.reduce((sum, point) => sum + point.ОставшаясяПотребность, 0);
  const totalNeed = pointsInfo.reduce((sum, point) => sum + point.need, 0);
  return 100 - (fulfilledNeed / totalNeed) * 100;
}
// ------------------------------------------------------------- //
