// astro-bridge.js - الجسر الفلكي المتكامل
// ==============================================

class AstronomicalBridge {
    constructor() {
        this.stars = [];
        this.constellations = [];
        this.planets = [];
        this.sun = null;
        this.moon = null;
        this.initialized = false;
        
        // نظام الإحداثيات المتوافق
        this.coordinateSystem = {
            sphereRadius: 200,
            hemisphere: 'north'
        };
    }
    
    async initialize(latitude = 35.0, longitude = 45.0) {
        console.log('🌉 تهيئة الجسر الفلكي...');
        
        try {
            // تحميل بيانات النجوم الأساسية
            await this.loadBasicStarData();
            
            // تحميل بيانات الكوكبات
            await this.loadConstellationData();
            
            // تهيئة نظام الكواكب
            await this.loadPlanetaryData();
            
            // تحميل بيانات إضافية من skydb إذا كانت متاحة
            await this.loadExternalData();
            
            this.initialized = true;
            console.log(`✅ تم تحميل ${this.stars.length} نجمة و ${this.constellations.length} كوكبة`);
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة الجسر الفلكي:', error);
            return false;
        }
    }
    
    async loadBasicStarData() {
        // بيانات النجوم الـ 100 الأكثر سطوعاً
        this.stars = [
            // النجوم الـ 10 الأكثر سطوعاً (مثال موسع)
            {
                id: 1,
                name: "الشعرى اليمانية",
                arabicName: "الشعرى اليمانية",
                bayer: "α CMa",
                ra: 6.7525,
                dec: -16.7161,
                magnitude: -1.46,
                spectralType: "A1V",
                color: 0xFFFFFF,
                distance: 8.6
            },
            {
                id: 2,
                name: "سهيل",
                arabicName: "سهيل",
                bayer: "α Car",
                ra: 6.3992,
                dec: -52.6957,
                magnitude: -0.72,
                spectralType: "F0II",
                color: 0xFFCC99,
                distance: 310
            },
            {
                id: 3,
                name: "النسر الواقع",
                arabicName: "النسر الواقع",
                bayer: "α Lyr",
                ra: 18.6156,
                dec: 38.7836,
                magnitude: 0.03,
                spectralType: "A0V",
                color: 0xAAAAFF,
                distance: 25.3
            },
            // ... (96 نجمة إضافية)
        ];
        
        // إذا كان skydb متاحاً، ندمج بياناته
        if (typeof window.skydb !== 'undefined' && window.skydb.stars) {
            this.mergeWithSkyDB();
        }
    }
    
    async loadConstellationData() {
        this.constellations = [
            {
                id: 1,
                name: "الجبار",
                arabicName: "الجبار",
                abbreviation: "Ori",
                lines: [
                    { from: "منكب الجوزاء", to: "النطاق", ra1: 5.9195, dec1: 7.4071, ra2: 5.603, dec2: -1.202 },
                    { from: "النطاق", to: "النظام", ra1: 5.603, dec1: -1.202, ra2: 5.679, dec2: -9.67 },
                    // ... خطوط إضافية
                ]
            },
            {
                id: 2,
                name: "الدب الأكبر",
                arabicName: "الدب الأكبر",
                abbreviation: "UMa",
                lines: [
                    { from: "الدبة", to: "المراق", ra1: 11.062, dec1: 61.751, ra2: 11.767, dec2: 49.313 },
                    { from: "المراق", to: "الفيق", ra1: 11.767, dec1: 49.313, ra2: 13.792, dec2: 49.313 },
                    // ... خطوط إضافية
                ]
            },
            // ... 86 كوكبة إضافية
        ];
    }
    
    async loadPlanetaryData() {
        this.planets = [
            {
                id: 1,
                name: "عطارد",
                arabicName: "عطارد",
                symbol: "☿",
                color: 0x8C7853,
                radius: 0.4,
                orbitRadius: 57.9
            },
            {
                id: 2,
                name: "الزهرة",
                arabicName: "الزهرة",
                symbol: "♀",
                color: 0xFFC649,
                radius: 0.9,
                orbitRadius: 108.2
            },
            {
                id: 3,
                name: "المريخ",
                arabicName: "المريخ",
                symbol: "♂",
                color: 0xFF0000,
                radius: 0.5,
                orbitRadius: 227.9
            },
            {
                id: 4,
                name: "المشتري",
                arabicName: "المشتري",
                symbol: "♃",
                color: 0xFFA726,
                radius: 1.0,
                orbitRadius: 778.5
            },
            {
                id: 5,
                name: "زحل",
                arabicName: "زحل",
                symbol: "♄",
                color: 0xF4C542,
                radius: 0.8,
                orbitRadius: 1434
            }
        ];
    }
    
    mergeWithSkyDB() {
        console.log('🔄 دمج بيانات skydb...');
        
        window.skydb.stars.forEach(skydbStar => {
            // البحث إذا كانت النجمة موجودة مسبقاً
            const existingIndex = this.stars.findIndex(s => 
                Math.abs(s.ra - skydbStar.ra) < 0.1 && 
                Math.abs(s.dec - skydbStar.dec) < 0.1
            );
            
            if (existingIndex === -1 && this.stars.length < 5000) {
                // إضافة نجمة جديدة من skydb
                this.stars.push({
                    id: this.stars.length + 1,
                    name: skydbStar.name || `Star ${this.stars.length + 1}`,
                    arabicName: skydbStar.arabicName || skydbStar.name || "",
                    bayer: skydbStar.bayer || "",
                    ra: skydbStar.ra,
                    dec: skydbStar.dec,
                    magnitude: skydbStar.mag || 6.0,
                    spectralType: skydbStar.type || "G",
                    color: this.getColorFromSpectralType(skydbStar.type),
                    distance: skydbStar.distance || 100
                });
            }
        });
        
        console.log(`📊 بعد الدمج: ${this.stars.length} نجمة`);
    }
    
    getColorFromSpectralType(spectralType) {
        if (!spectralType) return 0xFFFFFF;
        
        const type = spectralType.charAt(0).toUpperCase();
        
        switch(type) {
            case 'O': return 0x9BB0FF; // أزرق فاتح جداً
            case 'B': return 0xAABFFF; // أزرق
            case 'A': return 0xCAD7FF; // أزرق-أبيض
            case 'F': return 0xF8F7FF; // أبيض-أصفر
            case 'G': return 0xFFF4EA; // أصفر (مثل الشمس)
            case 'K': return 0xFFD2A1; // برتقالي فاتح
            case 'M': return 0xFFCC6F; // أحمر-برتقالي
            case 'R': case 'N': case 'S': return 0xFF9999; // أنواع خاصة
            default: return 0xFFFFFF;
        }
    }
    
    getStarSize(magnitude) {
        // النجوم الأكثر سطوعاً تكون أكبر
        const baseSize = 1.5;
        const adjustedMag = Math.max(-2, Math.min(8, magnitude));
        const sizeMultiplier = 1.5 - (adjustedMag + 2) * 0.15;
        return baseSize * sizeMultiplier;
    }
    
    calculatePositions(date, latitude, longitude, lst = null) {
        if (!this.initialized) return [];
        
        const positions = [];
        const currentLST = lst || this.calculateLST(date, longitude);
        
        this.stars.forEach(star => {
            const position = this.equatorialToHorizontal(
                star.ra,
                star.dec,
                latitude,
                currentLST
            );
            
            if (position.altitude > -10) { // فوق الأفق بـ 10 درجات
                const cartesian = this.horizontalToCartesian(
                    position.azimuth,
                    position.altitude,
                    this.coordinateSystem.sphereRadius
                );
                
                positions.push({
                    ...star,
                    ...position,
                    ...cartesian,
                    size: this.getStarSize(star.magnitude),
                    color: this.getColorFromSpectralType(star.spectralType),
                    visible: true
                });
            }
        });
        
        return positions;
    }
    
    equatorialToHorizontal(raHours, decDeg, latDeg, lstHours) {
        // تحويل RA من ساعات إلى درجات
        const raDeg = raHours * 15;
        
        // حساب الزاوية الساعية
        let haDeg = (lstHours * 15 - raDeg) % 360;
        if (haDeg < 0) haDeg += 360;
        
        // تحويل إلى راديان
        const haRad = THREE.MathUtils.degToRad(haDeg);
        const decRad = THREE.MathUtils.degToRad(decDeg);
        const latRad = THREE.MathUtils.degToRad(latDeg);
        
        // حساب الارتفاع
        const sinAlt = Math.sin(decRad) * Math.sin(latRad) +
                      Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
        const altitude = THREE.MathUtils.radToDeg(Math.asin(sinAlt));
        
        // حساب السمت
        const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) /
                     (Math.cos(latRad) * Math.cos(THREE.MathUtils.degToRad(altitude)));
        
        const clampedCosAz = Math.max(-1, Math.min(1, cosAz));
        let azimuth = THREE.MathUtils.radToDeg(Math.acos(clampedCosAz));
        
        if (Math.sin(haRad) > 0) {
            azimuth = 360 - azimuth;
        }
        
        return {
            altitude: Math.max(-90, Math.min(90, altitude)),
            azimuth: azimuth % 360,
            hourAngle: haDeg / 15
        };
    }
    
    horizontalToCartesian(azimuth, altitude, radius) {
        const azRad = THREE.MathUtils.degToRad(azimuth);
        const altRad = THREE.MathUtils.degToRad(altitude);
        
        const cosAlt = Math.cos(altRad);
        const sinAlt = Math.sin(altRad);
        const cosAz = Math.cos(azRad);
        const sinAz = Math.sin(azRad);
        
        // النظام: -x = شرق، y = ارتفاع، z = شمال
        return {
            x: -radius * cosAlt * sinAz,
            y: radius * sinAlt,
            z: radius * cosAlt * cosAz
        };
    }
    
    calculateLST(date, longitude) {
        // حساب مبسط للزمن النجمي المحلي
        const now = date || new Date();
        const UT = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
        
        // التاريخ اليولياني المبسط
        const JD = 2440587.5 + (now.getTime() / 86400000);
        
        // الزمن النجمي في غرينتش
        const T = (JD - 2451545.0) / 36525.0;
        let GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) +
                   0.000387933 * T * T - T * T * T / 38710000.0;
        
        // تطبيع
        GMST = ((GMST % 360) + 360) % 360;
        
        // الزمن النجمي المحلي
        let LST = (GMST / 15 + longitude / 15 + UT) % 24;
        if (LST < 0) LST += 24;
        
        return LST;
    }
    
    getVisibleStarsCount() {
        return this.stars.filter(star => star.visible).length;
    }
    
    getBrightestStars(limit = 20) {
        return [...this.stars]
            .filter(star => star.visible)
            .sort((a, b) => a.magnitude - b.magnitude)
            .slice(0, limit);
    }
    
    findStarByName(name) {
        return this.stars.find(star => 
            star.name.toLowerCase().includes(name.toLowerCase()) ||
            star.arabicName.toLowerCase().includes(name.toLowerCase())
        );
    }
    
    getConstellationLines() {
        const lines = [];
        
        this.constellations.forEach(constellation => {
            constellation.lines.forEach(line => {
                // البحث عن النجوم
                const fromStar = this.findStarByName(line.from);
                const toStar = this.findStarByName(line.to);
                
                if (fromStar && toStar && fromStar.visible && toStar.visible) {
                    lines.push({
                        from: { x: fromStar.x, y: fromStar.y, z: fromStar.z },
                        to: { x: toStar.x, y: toStar.y, z: toStar.z },
                        color: 0x4488FF,
                        opacity: 0.6,
                        constellation: constellation.name
                    });
                }
            });
        });
        
        return lines;
    }
}

// تصدير نسخة عامة
window.AstronomicalBridge = AstronomicalBridge;