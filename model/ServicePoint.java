package ru.socialmap.model;
import jakarta.persistence.*;
@Entity
@Table(name = "service_point")
public class ServicePoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(columnDefinition = "TEXT")
    private String name;
    @Column(columnDefinition = "TEXT")
    private String distributorNetwork;
    @Column(columnDefinition = "TEXT")
    private String legalEntity;
    @Column(columnDefinition = "TEXT")
    private String category;
    @Column(columnDefinition = "TEXT")
    private String admArea;
    @Column(columnDefinition = "TEXT")
    private String district;
    @Column(columnDefinition = "TEXT")
    private String address;
    @Column(columnDefinition = "TEXT")
    private String workingHours;
    @Column(columnDefinition = "TEXT")
    private String phone;
    private int minDiscount;
    private int maxDiscount;
    private int minDiscountRub;
    private int maxDiscountRub;
    @Column(columnDefinition = "TEXT")
    private String specialRate;
    @Column(columnDefinition = "TEXT")
    private String termsDiscount;
    @Column(columnDefinition = "TEXT")
    private String extraInfo;
    @Column(columnDefinition = "TEXT")
    private String website;
    @Column(columnDefinition = "TEXT")
    private String inn;
    @Column(columnDefinition = "TEXT")
    private String onTerritoryOfMoscow;
    @Column(columnDefinition = "TEXT")
    private String categoriesOfHolders;
    private long globalId;
    @Column(columnDefinition = "TEXT")
    private String geoData;
    @Column(columnDefinition = "TEXT")
    private String geoDataCenter;
    private double latitude;
    private double longitude;
    public ServicePoint() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDistributorNetwork() { return distributorNetwork; }
    public void setDistributorNetwork(String distributorNetwork) { this.distributorNetwork = distributorNetwork; }
    public String getLegalEntity() { return legalEntity; }
    public void setLegalEntity(String legalEntity) { this.legalEntity = legalEntity; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getAdmArea() { return admArea; }
    public void setAdmArea(String admArea) { this.admArea = admArea; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getWorkingHours() { return workingHours; }
    public void setWorkingHours(String workingHours) { this.workingHours = workingHours; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public int getMinDiscount() { return minDiscount; }
    public void setMinDiscount(int minDiscount) { this.minDiscount = minDiscount; }
    public int getMaxDiscount() { return maxDiscount; }
    public void setMaxDiscount(int maxDiscount) { this.maxDiscount = maxDiscount; }
    public int getMinDiscountRub() { return minDiscountRub; }
    public void setMinDiscountRub(int minDiscountRub) { this.minDiscountRub = minDiscountRub; }
    public int getMaxDiscountRub() { return maxDiscountRub; }
    public void setMaxDiscountRub(int maxDiscountRub) { this.maxDiscountRub = maxDiscountRub; }
    public String getSpecialRate() { return specialRate; }
    public void setSpecialRate(String specialRate) { this.specialRate = specialRate; }
    public String getTermsDiscount() { return termsDiscount; }
    public void setTermsDiscount(String termsDiscount) { this.termsDiscount = termsDiscount; }
    public String getExtraInfo() { return extraInfo; }
    public void setExtraInfo(String extraInfo) { this.extraInfo = extraInfo; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getInn() { return inn; }
    public void setInn(String inn) { this.inn = inn; }
    public String getOnTerritoryOfMoscow() { return onTerritoryOfMoscow; }
    public void setOnTerritoryOfMoscow(String onTerritoryOfMoscow) { this.onTerritoryOfMoscow = onTerritoryOfMoscow; }
    public String getCategoriesOfHolders() { return categoriesOfHolders; }
    public void setCategoriesOfHolders(String categoriesOfHolders) { this.categoriesOfHolders = categoriesOfHolders; }
    public long getGlobalId() { return globalId; }
    public void setGlobalId(long globalId) { this.globalId = globalId; }
    public String getGeoData() { return geoData; }
    public void setGeoData(String geoData) { this.geoData = geoData; }
    public String getGeoDataCenter() { return geoDataCenter; }
    public void setGeoDataCenter(String geoDataCenter) { this.geoDataCenter = geoDataCenter; }
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
}
