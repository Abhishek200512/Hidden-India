const fs = require('fs');
const path = require('path');
const https = require('https');

const url = 'https://raw.githubusercontent.com/datameet/maps/master/Country/india-composite.geojson';

console.log('Fetching India GeoJSON...');
https.get(url, (res) => {
  let rawData = '';
  res.on('data', chunk => rawData += chunk);
  res.on('end', () => {
    console.log(`Downloaded ${Math.round(rawData.length / 1024)} KB. Parsing JSON...`);
    const geojson = JSON.parse(rawData);
    
    // Find all polygon rings
    let rings = [];
    geojson.features.forEach(f => {
      if (f.geometry.type === 'Polygon') {
        rings.push(f.geometry.coordinates[0]);
      } else if (f.geometry.type === 'MultiPolygon') {
        f.geometry.coordinates.forEach(poly => {
          rings.push(poly[0]);
        });
      }
    });

    // Find the mainland ring (largest point count / area)
    rings.sort((a, b) => b.length - a.length);
    const mainland = rings[0];
    console.log(`Mainland India has ${mainland.length} points.`);

    // Ramer-Douglas-Peucker simplification algorithm
    function getSqDist(p1, p2) {
      const dx = p1[0] - p2[0], dy = p1[1] - p2[1];
      return dx * dx + dy * dy;
    }

    function getSqSegDist(p, p1, p2) {
      let x = p1[0], y = p1[1], dx = p2[0] - x, dy = p2[1] - y;
      if (dx !== 0 || dy !== 0) {
        const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
        if (t > 1) {
          x = p2[0];
          y = p2[1];
        } else if (t > 0) {
          x += dx * t;
          y += dy * t;
        }
      }
      dx = p[0] - x;
      dy = p[1] - y;
      return dx * dx + dy * dy;
    }

    function simplifyDPStep(points, first, last, sqTolerance, simplified) {
      let maxSqDist = sqTolerance, index;
      for (let i = first + 1; i < last; i++) {
        const sqDist = getSqSegDist(points[i], points[first], points[last]);
        if (sqDist > maxSqDist) {
          index = i;
          maxSqDist = sqDist;
        }
      }
      if (maxSqDist > sqTolerance) {
        if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
        simplified.push(points[index]);
        if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
      }
    }

    function simplify(points, tolerance) {
      if (points.length <= 2) return points;
      const sqTolerance = tolerance * tolerance;
      const last = points.length - 1;
      const simplified = [points[0]];
      simplifyDPStep(points, 0, last, sqTolerance, simplified);
      simplified.push(points[last]);
      return simplified;
    }

    // Target ~250-350 points for high visual fidelity and top WebGL performance
    let tol = 0.08; // approx degrees
    let simplified = simplify(mainland, tol);
    console.log(`Tolerance ${tol} produced ${simplified.length} points.`);

    // Format as [lat, lng] array with 4 decimal places
    const formatted = simplified.map(pt => [
      Math.round(pt[1] * 10000) / 10000, // lat
      Math.round(pt[0] * 10000) / 10000  // lng
    ]);

    const outPath = path.join(__dirname, '..', 'src', 'data', 'indiaBoundary.js');
    const content = `// High-fidelity geographic boundary of India (WGS84 lat/lng coordinates)
// Derived from official public cartographic boundary data
export const INDIA_BOUNDARY = ${JSON.stringify(formatted, null, 2)};
`;

    fs.writeFileSync(outPath, content, 'utf8');
    console.log(`Saved ${formatted.length} boundary points to ${outPath}`);
  });
}).on('error', err => {
  console.error('Download error:', err.message);
});
