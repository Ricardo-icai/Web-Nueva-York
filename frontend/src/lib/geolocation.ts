type Coordinates = { lat: number; lng: number };

type GeolocationErrorLike = {
  code?: number;
};

function isGeolocationError(value: unknown): value is GeolocationErrorLike {
  return typeof value === "object" && value !== null && "code" in value;
}

function describeGeolocationError(error: GeolocationErrorLike) {
  switch (error.code) {
    case 1:
      return "Has bloqueado la ubicacion para esta web. Activa el permiso del navegador y vuelve a intentarlo.";
    case 2:
      return "No he podido localizar el movil. Prueba otra vez con mejor cobertura o saliendo del navegador integrado.";
    case 3:
      return "La ubicacion esta tardando demasiado. Voy a intentar una version mas rapida.";
    default:
      return "No he podido obtener tu ubicacion desde este movil.";
  }
}

function attemptPosition(options: PositionOptions) {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export async function getDeviceCoordinates(): Promise<Coordinates> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new Error("Tu navegador no permite geolocalizacion.");
  }

  try {
    const precise = await attemptPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
    return {
      lat: precise.coords.latitude,
      lng: precise.coords.longitude,
    };
  } catch (error) {
    if (!isGeolocationError(error)) {
      throw new Error("No he podido obtener tu ubicacion desde este movil.");
    }
    if (error.code === 1) {
      throw new Error(describeGeolocationError(error));
    }

    try {
      const quick = await attemptPosition({
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000,
      });
      return {
        lat: quick.coords.latitude,
        lng: quick.coords.longitude,
      };
    } catch (fallbackError) {
      if (isGeolocationError(fallbackError)) {
        throw new Error(describeGeolocationError(fallbackError));
      }
      throw new Error("No he podido obtener tu ubicacion desde este movil.");
    }
  }
}
