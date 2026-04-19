export type CitySlug = "greenville" | "spartanburg" | "anderson" | "easley" | "seneca";

export type City = {
  slug: CitySlug;
  name: string;
  county: string;
  neighborhoods: string[];
};

export const cities: Record<CitySlug, City> = {
  greenville: {
    slug: "greenville",
    name: "Greenville",
    county: "Greenville",
    neighborhoods: ["Greer", "Mauldin", "Simpsonville", "Travelers Rest", "Taylors", "Five Forks"],
  },
  spartanburg: {
    slug: "spartanburg",
    name: "Spartanburg",
    county: "Spartanburg",
    neighborhoods: ["Boiling Springs", "Inman", "Roebuck", "Duncan", "Lyman", "Cowpens"],
  },
  anderson: {
    slug: "anderson",
    name: "Anderson",
    county: "Anderson",
    neighborhoods: ["Pendleton", "Belton", "Williamston", "Powdersville", "Iva", "Honea Path"],
  },
  easley: {
    slug: "easley",
    name: "Easley",
    county: "Pickens",
    neighborhoods: ["Liberty", "Pickens", "Central", "Clemson", "Six Mile"],
  },
  seneca: {
    slug: "seneca",
    name: "Seneca",
    county: "Oconee",
    neighborhoods: ["Walhalla", "Westminster", "Salem", "West Union", "Mountain Rest"],
  },
};

export const citySlugs = Object.keys(cities) as CitySlug[];
