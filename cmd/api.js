// ============================================
// MOCK DATA - Replace with API calls later
// ============================================
const sampleData = [
    {
        name: "Superman",
        images: { xs: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/xs/644-superman.jpg" },
        biography: {
            fullName: "Clark Kent",
            placeOfBirth: "Krypton",
            alignment: "good"
        },
        powerstats: {
            intelligence: "94",
            strength: "100",
            speed: "100",
            durability: "100",
            power: "100",
            combat: "85"
        },
        appearance: {
            race: "Kryptonian",
            gender: "Male",
            height: ["6'3", "191 cm"],
            weight: ["235 lb", "107 kg"]
        }
    },
    {
        name: "Batman",
        images: { xs: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/xs/70-batman.jpg" },
        biography: {
            fullName: "Bruce Wayne",
            placeOfBirth: "Gotham City",
            alignment: "good"
        },
        powerstats: {
            intelligence: "100",
            strength: "26",
            speed: "27",
            durability: "50",
            power: "47",
            combat: "100"
        },
        appearance: {
            race: "Human",
            gender: "Male",
            height: ["6'2", "188 cm"],
            weight: ["210 lb", "95 kg"]
        }
    },
    {
        name: "Wonder Woman",
        images: { xs: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/xs/720-wonder-woman.jpg" },
        biography: {
            fullName: "Diana Prince",
            placeOfBirth: "Themyscira",
            alignment: "good"
        },
        powerstats: {
            intelligence: "92",
            strength: "100",
            speed: "60",
            durability: "100",
            power: "100",
            combat: "100"
        },
        appearance: {
            race: "Amazon",
            gender: "Female",
            height: ["6'0", "183 cm"],
            weight: ["165 lb", "75 kg"]
        }
    },
    {
        name: "Spider-Man",
        images: { xs: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/xs/620-spider-man.jpg" },
        biography: {
            fullName: "Peter Parker",
            placeOfBirth: "New York City",
            alignment: "good"
        },
        powerstats: {
            intelligence: "90",
            strength: "55",
            speed: "67",
            durability: "75",
            power: "74",
            combat: "85"
        },
        appearance: {
            race: "Human",
            gender: "Male",
            height: ["5'10", "178 cm"],
            weight: ["165 lb", "75 kg"]
        }
    },
    {
        name: "Iron Man",
        images: { xs: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/xs/346-iron-man.jpg" },
        biography: {
            fullName: "Tony Stark",
            placeOfBirth: "Long Island",
            alignment: "good"
        },
        powerstats: {
            intelligence: "100",
            strength: "85",
            speed: "58",
            durability: "85",
            power: "100",
            combat: "64"
        },
        appearance: {
            race: "Human",
            gender: "Male",
            height: ["6'1", "185 cm"],
            weight: ["190 lb", "86 kg"]
        }
    },
    {
        name: "Thor",
        images: { xs: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/xs/659-thor.jpg" },
        biography: {
            fullName: "Thor Odinson",
            placeOfBirth: "Asgard",
            alignment: "good"
        },
        powerstats: {
            intelligence: "85",
            strength: "100",
            speed: "55",
            durability: "100",
            power: "100",
            combat: "100"
        },
        appearance: {
            race: "Asgardian",
            gender: "Male",
            height: ["6'6", "198 cm"],
            weight: ["640 lb", "290 kg"]
        }
    },
    {
        name: "Captain America",
        images: { xs: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/xs/149-captain-america.jpg" },
        biography: {
            fullName: "Steve Rogers",
            placeOfBirth: "Brooklyn",
            alignment: "good"
        },
        powerstats: {
            intelligence: "75",
            strength: "80",
            speed: "45",
            durability: "80",
            power: "65",
            combat: "100"
        },
        appearance: {
            race: "Human",
            gender: "Male",
            height: ["6'2", "188 cm"],
            weight: ["220 lb", "100 kg"]
        }
    },
    {
        name: "Black Widow",
        images: { xs: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/xs/107-black-widow.jpg" },
        biography: {
            fullName: "Natasha Romanoff",
            placeOfBirth: "Stalingrad",
            alignment: "good"
        },
        powerstats: {
            intelligence: "85",
            strength: "20",
            speed: "50",
            durability: "35",
            power: "45",
            combat: "100"
        },
        appearance: {
            race: "Human",
            gender: "Female",
            height: ["5'7", "170 cm"],
            weight: ["130 lb", "59 kg"]
        }
    },
    {
        name: "Joker",
        images: { xs: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/xs/370-joker.jpg" },
        biography: {
            fullName: "Jack Napier",
            placeOfBirth: "Gotham City",
            alignment: "bad"
        },
        powerstats: {
            intelligence: "100",
            strength: "10",
            speed: "12",
            durability: "15",
            power: "25",
            combat: "75"
        },
        appearance: {
            race: "Human",
            gender: "Male",
            height: ["6'0", "183 cm"],
            weight: ["175 lb", "79 kg"]
        }
    }
];


// Make data available to other files
window.sampleData = sampleData;
window.fetchHeroes = fetchHeroes;