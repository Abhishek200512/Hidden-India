const fs = require('fs');
const path = require('path');
const https = require('https');

const destinationsDir = path.join(__dirname, 'public', 'images', 'destinations');
const culturalDir = path.join(__dirname, 'public', 'images', 'cultural');

fs.mkdirSync(destinationsDir, { recursive: true });
fs.mkdirSync(culturalDir, { recursive: true });

const downloads = [
  // Ziro Valley
  {
    dest: path.join(destinationsDir, 'ziro-gallery-1.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/A_section_of_Ziro_valley.jpg/1280px-A_section_of_Ziro_valley.jpg'
  },
  {
    dest: path.join(destinationsDir, 'ziro-gallery-2.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Ziro_and_its_green_valley.jpg/1280px-Ziro_and_its_green_valley.jpg'
  },

  // Majuli Island
  {
    dest: path.join(destinationsDir, 'majuli-island.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Brahmaputra_river_in_Majuli_Island.jpg/1280px-Brahmaputra_river_in_Majuli_Island.jpg'
  },
  {
    dest: path.join(destinationsDir, 'majuli-gallery-1.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Ferry_service_connecting_Majuli_island.jpg/1280px-Ferry_service_connecting_Majuli_island.jpg'
  },
  {
    dest: path.join(destinationsDir, 'majuli-gallery-2.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Mask_in_the_making%2C_Majuli%2C_Assam.jpg/1280px-Mask_in_the_making%2C_Majuli%2C_Assam.jpg'
  },

  // Dzukou Valley
  {
    dest: path.join(destinationsDir, 'dzukou-valley.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Breathtaking_beauty_of_Dzukou_Valley_in_Manipur-Nagaland_border_%28edit%29.jpg/1280px-Breathtaking_beauty_of_Dzukou_Valley_in_Manipur-Nagaland_border_%28edit%29.jpg'
  },
  {
    dest: path.join(destinationsDir, 'dzukou-gallery-1.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Dz%C3%BCkou_Valley%2C_Viswema%2C_Nagaland_27.jpg/1280px-Dz%C3%BCkou_Valley%2C_Viswema%2C_Nagaland_27.jpg'
  },
  {
    dest: path.join(destinationsDir, 'dzukou-gallery-2.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Dz%C3%BCkou_Valley%2C_Viswema%2C_Nagaland_48.jpg/1280px-Dz%C3%BCkou_Valley%2C_Viswema%2C_Nagaland_48.jpg'
  },

  // Gandikota
  {
    dest: path.join(destinationsDir, 'gandikota.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Gandikota_Gorge_%2810882%29.jpg/1280px-Gandikota_Gorge_%2810882%29.jpg'
  },
  {
    dest: path.join(destinationsDir, 'gandikota-gallery-1.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/A_view_of_Gandikota_Canyon_from_Raghunatha_Swamy_Temple.jpg/1280px-A_view_of_Gandikota_Canyon_from_Raghunatha_Swamy_Temple.jpg'
  },
  {
    dest: path.join(destinationsDir, 'gandikota-gallery-2.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Gandikota_Fort_%2829267%29.jpg/1280px-Gandikota_Fort_%2829267%29.jpg'
  },

  // Chettinad
  {
    dest: path.join(destinationsDir, 'chettinad.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Chettinad_Mansion_Kanadukathan.jpg'
  },
  {
    dest: path.join(destinationsDir, 'chettinad-gallery-1.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Attangudi_Palace-Athangudi_Tiles-WUS04306.jpg/1280px-Attangudi_Palace-Athangudi_Tiles-WUS04306.jpg'
  },
  {
    dest: path.join(destinationsDir, 'chettinad-gallery-2.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Athangudi_tiles_01.jpg/1280px-Athangudi_tiles_01.jpg'
  },

  // Mawlynnong
  {
    dest: path.join(destinationsDir, 'mawlynnong.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Living_root_bridge%2C_Maghalaya%2C_India1.jpg/1280px-Living_root_bridge%2C_Maghalaya%2C_India1.jpg'
  },
  {
    dest: path.join(destinationsDir, 'mawlynnong-gallery-1.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Living_root_bridge%2C_Maghalaya%2C_India2.jpg/1280px-Living_root_bridge%2C_Maghalaya%2C_India2.jpg'
  },
  {
    dest: path.join(destinationsDir, 'mawlynnong-gallery-2.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Living_root_bridge%2C_Maghalaya%2C_India4.jpg/1280px-Living_root_bridge%2C_Maghalaya%2C_India4.jpg'
  },

  // Lonar Crater
  {
    dest: path.join(destinationsDir, 'lonar-crater.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Lonar_Crater%2C_Panorama.jpg/1280px-Lonar_Crater%2C_Panorama.jpg'
  },
  {
    dest: path.join(destinationsDir, 'lonar-gallery-1.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Lonar_Panorama.JPG/1280px-Lonar_Panorama.JPG'
  },
  {
    dest: path.join(destinationsDir, 'lonar-gallery-2.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Lonar_Lake_crater.jpg/1280px-Lonar_Lake_crater.jpg'
  },

  // Orchha
  {
    dest: path.join(destinationsDir, 'orchha.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Chhatris_on_the_bank_of_the_Betwa_River%2C_Orchha%2C_Madhya_Pradesh.jpg/1280px-Chhatris_on_the_bank_of_the_Betwa_River%2C_Orchha%2C_Madhya_Pradesh.jpg'
  },
  {
    dest: path.join(destinationsDir, 'orchha-gallery-1.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Chhatris_at_bank_of_Betwa_%28Orchha%2C_India%29.jpg/1280px-Chhatris_at_bank_of_Betwa_%28Orchha%2C_India%29.jpg'
  },
  {
    dest: path.join(destinationsDir, 'orchha-gallery-2.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Chhatris_at_bank_of_Betwa_%28Orchha%2C_India%29_at_Sunset.jpg/1280px-Chhatris_at_bank_of_Betwa_%28Orchha%2C_India%29_at_Sunset.jpg'
  },

  // Cultural items
  {
    dest: path.join(culturalDir, 'hemis-cham.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Buddhist_monks_dancing_the_Cham_in_the_Himalayan_monastery_of_Lamayuru.jpg/1280px-Buddhist_monks_dancing_the_Cham_in_the_Himalayan_monastery_of_Lamayuru.jpg'
  },
  {
    dest: path.join(culturalDir, 'majuli-masks.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Mask_in_the_making%2C_Majuli%2C_Assam.jpg/1280px-Mask_in_the_making%2C_Majuli%2C_Assam.jpg'
  },
  {
    dest: path.join(culturalDir, 'kath-kuni.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Kath_Kuni_Style_Local_Deity_Temple%2C_Kullu_District%2C_Himachal_Pradesh.jpg/1280px-Kath_Kuni_Style_Local_Deity_Temple%2C_Kullu_District%2C_Himachal_Pradesh.jpg'
  },
  {
    dest: path.join(culturalDir, 'baul-mystics.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Baul_singer_in_turban_with_ektara_at_Bangla_WikiConference_2026_%28DSC07448%29.jpg/1280px-Baul_singer_in_turban_with_ektara_at_Bangla_WikiConference_2026_%28DSC07448%29.jpg'
  },
  {
    dest: path.join(culturalDir, 'manganiyar.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Manganiyar_Singers.jpg/1280px-Manganiyar_Singers.jpg'
  },
  {
    dest: path.join(culturalDir, 'ilanjithara-melam.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Melam_ArattupuzhaTemplePooram.JPG/1280px-Melam_ArattupuzhaTemplePooram.JPG'
  },
  {
    dest: path.join(culturalDir, 'naga-cuisine.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Naga_Smoked_Pork_with_Axone_%28Fermented_Soyabeans%29.jpg/1280px-Naga_Smoked_Pork_with_Axone_%28Fermented_Soyabeans%29.jpg'
  },
  {
    dest: path.join(culturalDir, 'monpa-clans.jpg'),
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Changdung%2C_Monpa_tribe%2C_Tawang_district-_RIWATCH_Museum.jpg/1280px-Changdung%2C_Monpa_tribe%2C_Tawang_district-_RIWATCH_Museum.jpg'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = {
      headers: {
        'User-Agent': 'HiddenIndiaTourismProject/2.0 (contact@hiddenindia.tourism; research and educational preservation)'
      }
    };

    function get(reqUrl) {
      https.get(reqUrl, options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          reject(new Error(`Failed with status code: ${res.statusCode} for ${reqUrl}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(dest));
        });
      }).on('error', (err) => {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
    }

    get(url);
  });
}

async function run() {
  console.log(`Starting download of ${downloads.length} authentic images...`);
  for (let i = 0; i < downloads.length; i++) {
    const item = downloads[i];
    const filename = path.basename(item.dest);
    try {
      console.log(`[${i + 1}/${downloads.length}] Downloading ${filename}...`);
      await downloadFile(item.url, item.dest);
      const stat = fs.statSync(item.dest);
      console.log(`  ✓ Saved ${filename} (${Math.round(stat.size / 1024)} KB)`);
    } catch (err) {
      console.error(`  ✗ Error downloading ${filename}: ${err.message}`);
    }
    // Rate limit courtesy delay
    await new Promise(r => setTimeout(r, 600));
  }
  console.log('Finished downloads.');
}

run();
