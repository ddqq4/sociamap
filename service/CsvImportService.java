//package ru.socialmap.service;
//
//import jakarta.annotation.PostConstruct;
//import org.springframework.stereotype.Service;
//import ru.socialmap.model.ServicePoint;
//import ru.socialmap.repository.ServicePointRepository;
//
//import java.io.BufferedReader;
//import java.io.InputStream;
//import java.io.InputStreamReader;
//import java.nio.charset.StandardCharsets;
//import java.util.regex.Matcher;
//import java.util.regex.Pattern;
//
//@Service
//public class CsvImportService {
//
//    private final ServicePointRepository repository;
//
//    public CsvImportService(ServicePointRepository repository) {
//        this.repository = repository;
//    }
//
//    @PostConstruct
//    public void importCsv() {
//        if (repository.count() > 0) {
//            System.out.println("База уже полная. Импорт пропущен.");
//            return;
//        }
//
//        System.out.println("Загружаем весь CSV в базу (включая все скидки)...");
//
//        try {
//            InputStream inputStream = getClass().getResourceAsStream("/data.csv");
//            if (inputStream == null) {
//                System.err.println("data.csv не найден в src/main/resources!");
//                return;
//            }
//
//            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
//            Pattern coordPattern = Pattern.compile("\\[([\\d.+-]+),\\s*([\\d.+-]+)\\]");
//
//            reader.readLine(); // английские заголовки
//            reader.readLine(); // русские заголовки
//
//            String line;
//            int count = 0;
//
//            while ((line = reader.readLine()) != null) {
//                if (line.trim().isEmpty()) continue;
//
//                String[] data = line.split(";", -1);
//                if (data.length < 23) continue;
//
//                ServicePoint point = new ServicePoint();
//
//                point.setName(clean(data[0]));
//                point.setDistributorNetwork(clean(data[1]));
//                point.setLegalEntity(clean(data[2]));
//                point.setCategory(clean(data[3]));
//                point.setAdmArea(clean(data[4]));
//                point.setDistrict(clean(data[5]));
//                point.setAddress(clean(data[6]));
//                point.setWorkingHours(clean(data[7]));
//                point.setPhone(clean(data[8]));
//
//                // СКИДКИ — теперь точно загружаются
//                point.setMinDiscount(parseInt(clean(data[9])));  // Минимальный размер скидки, %
//                point.setMaxDiscount(parseInt(clean(data[10]))); // Максимальный размер скидки, %
//                point.setMinDiscountRub(parseInt(clean(data[11]))); // Минимальный размер скидки, руб.
//                point.setMaxDiscountRub(parseInt(clean(data[12]))); // Максимальный размер скидки, руб.
//
//                point.setSpecialRate(clean(data[13]));
//                point.setTermsDiscount(clean(data[14]));
//                point.setExtraInfo(clean(data[15]));
//                point.setWebsite(clean(data[16]));
//                point.setInn(clean(data[17]));
//                point.setOnTerritoryOfMoscow(clean(data[18]));
//                point.setCategoriesOfHolders(clean(data[19]));
//                point.setGlobalId(parseLong(clean(data[20])));
//                point.setGeoData(clean(data[21]));
//                point.setGeoDataCenter(clean(data[22]));
//
//                // Координаты
//                double lat = 0.0, lon = 0.0;
//                String geo = clean(data[21]);
//                if (!geo.isEmpty()) {
//                    Matcher m = coordPattern.matcher(geo);
//                    if (m.find()) {
//                        lon = parseDouble(m.group(1));
//                        lat = parseDouble(m.group(2));
//                    }
//                }
//                point.setLatitude(lat);
//                point.setLongitude(lon);
//
//                repository.save(point);
//                count++;
//
//                if (count % 500 == 0) {
//                    System.out.println("Загружено: " + count + " организаций (включая скидки)");
//                }
//            }
//
//            reader.close();
//            System.out.println("ГОТОВО! Загружено " + count + " организаций со всеми скидками и данными.");
//
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//    }
//
//    private String clean(String s) {
//        return s == null ? "" : s.replace("\"", "").trim();
//    }
//
//    private int parseInt(String s) {
//        s = clean(s);
//        if (s.isEmpty()) return 0;
//        try {
//            return Integer.parseInt(s);
//        } catch (Exception e) {
//            return 0;
//        }
//    }
//
//    private long parseLong(String s) {
//        s = clean(s);
//        if (s.isEmpty()) return 0L;
//        try {
//            return Long.parseLong(s);
//        } catch (Exception e) {
//            return 0L;
//        }
//    }
//
//    private double parseDouble(String s) {
//        s = clean(s);
//        if (s.isEmpty()) return 0.0;
//        try {
//            return Double.parseDouble(s);
//        } catch (Exception e) {
//            return 0.0;
//        }
//    }
//}