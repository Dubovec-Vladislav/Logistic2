function calculateData() {
  const pointCount = document.getElementById('pointCount').value;
  const numberOfCars = parseInt(document.getElementById('carCount').value);
  const workTime = parseInt(document.getElementById('workTime').value);

  const depotToPointsDistances = [];
  const careerToPointsDistances = [];
  const needs = [];
  const carryingList = [];
  const minimumLoadFactors = [];

  for (let i = 0; i < pointCount; i++) {
    const depotDistance = parseFloat(document.getElementById(`depotDistance${i}`).value);
    const careerDistance = parseFloat(document.getElementById(`careerDistance${i}`).value);
    const pointNeeds = parseFloat(document.getElementById(`needs${i}`).value);
    depotToPointsDistances.push(depotDistance);
    careerToPointsDistances.push(careerDistance);
    needs.push(pointNeeds);
  }

  for (let i = 0; i < numberOfCars; i++) {
    const carrying = parseFloat(document.getElementById(`carryingList${i}`).value);
    const loadFactor = parseFloat(document.getElementById(`loadFactor${i}`).value);
    carryingList.push(carrying);
    minimumLoadFactors.push(loadFactor);
  }

  const transport = {
    speed: parseFloat(document.getElementById('speed').value),
    capacityUtilizationFactor: parseFloat(document.getElementById('capacityUtilizationFactor').value),
    loadingAndUnloadingTime: parseFloat(document.getElementById('loadingAndUnloadingTime').value),
  };

  main(depotToPointsDistances, careerToPointsDistances, needs, transport, numberOfCars, workTime, carryingList, minimumLoadFactors);
}
