// real-stars-renderer.js - محرك العرض الفلكي المتقدم
// =====================================================

class RealStarsRenderer {
    constructor(scene, astroBridge) {
        this.scene = scene;
        this.astroBridge = astroBridge;
        
        // مجموعات العرض
        this.starPoints = null;
        this.constellationLines = [];
        this.solarSystemObjects = [];
        
        // إعدادات العرض
        this.settings = {
            starSizeMultiplier: 1.0,
            starBrightness: 1.0,
            showConstellations: true,
            showPlanets: true,
            maxStars: 5000,
            lodDistance: 100 // مسافة تغيير مستوى التفاصيل
        };
        
        // ذاكرة التخزين المؤقت
        this.cache = {
            lastUpdate: 0,
            lastPosition: null,
            starBuffer: null
        };
    }
    
    async initialize() {
        console.log('✨ تهيئة محرك النجوم الحقيقية...');
        
        // تهيئة الجسر الفلكي
        await this.astroBridge.initialize();
        
        // إنشاء نظام النجوم
        this.createStarSystem();
        
        // إنشاء خطوط الكوكبات
        this.createConstellationLines();
        
        console.log('✅ محرك النجوم الحقيقي جاهز');
        return true;
    }
    
    createStarSystem() {
        // حساب المواقع الحالية
        const starData = this.astroBridge.calculatePositions(
            new Date(),
            SYSTEM.INITIAL_LATITUDE,
            45.0
        );
        
        // تحسين الأداء: تقسيم النجوم حسب السطوع
        const brightStars = starData.filter(s => s.magnitude <= 3.0);
        const mediumStars = starData.filter(s => s.magnitude > 3.0 && s.magnitude <= 5.0);
        const dimStars = starData.filter(s => s.magnitude > 5.0);
        
        // إنشاء هندسة متقدمة للنجوم
        this.createAdvancedStarGeometry(starData);
        
        // إضافة النجوم إلى المشهد
        this.addStarsToScene();
        
        // تحديث HUD
        this.updateStarCountDisplay(starData.length);
    }
    
    createAdvancedStarGeometry(starData) {
        const maxStars = Math.min(starData.length, this.settings.maxStars);
        
        // إنشاء مصفوفات BufferGeometry
        const positions = new Float32Array(maxStars * 3);
        const colors = new Float32Array(maxStars * 3);
        const sizes = new Float32Array(maxStars);
        const alphas = new Float32Array(maxStars);
        
        // تعبئة البيانات
        for (let i = 0; i < maxStars; i++) {
            const star = starData[i];
            const baseIndex = i * 3;
            
            // المواقع
            positions[baseIndex] = star.x;
            positions[baseIndex + 1] = star.y;
            positions[baseIndex + 2] = star.z;
            
            // الألوان
            const color = new THREE.Color(star.color || 0xFFFFFF);
            colors[baseIndex] = color.r;
            colors[baseIndex + 1] = color.g;
            colors[baseIndex + 2] = color.b;
            
            // الأحجام (حسب القدر الظاهري)
            sizes[i] = this.calculateDynamicStarSize(star);
            
            // الشفافية (حسب القدر الظاهري والارتفاع)
            alphas[i] = this.calculateStarAlpha(star);
        }
        
        // إنشاء الهندسة
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
        
        // إنشاء المادة المتقدمة
        const material = new THREE.ShaderMaterial({
            uniforms: {
                sizeMultiplier: { value: this.settings.starSizeMultiplier },
                brightness: { value: this.settings.starBrightness },
                time: { value: 0.0 }
            },
            vertexShader: `
                attribute float size;
                attribute float alpha;
                attribute vec3 color;
                varying float vAlpha;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    vAlpha = alpha;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z) * sizeMultiplier;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform float brightness;
                varying float vAlpha;
                varying vec3 vColor;
                
                void main() {
                    // تأثير نجمي دائري
                    float distance = length(gl_PointCoord - vec2(0.5));
                    float strength = 1.0 - smoothstep(0.0, 0.5, distance);
                    
                    // إضافة توهج مركزي
                    float glow = 1.0 - smoothstep(0.0, 0.3, distance);
                    glow = pow(glow, 2.0) * 0.5;
                    
                    // اللون النهائي
                    vec3 finalColor = vColor * brightness;
                    float finalAlpha = vAlpha * (strength + glow);
                    
                    gl_FragColor = vec4(finalColor, finalAlpha);
                    
                    // إضافة توهج بلوم (Bloom)
                    if (distance < 0.1) {
                        gl_FragColor.rgb *= 2.0;
                    }
                }
            `,
            transparent: true,
            vertexColors: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        // إنشاء نظام النقاط
        this.starPoints = new THREE.Points(geometry, material);
        this.starPoints.name = 'real-stars';
        
        // تخزين في الذاكرة المؤقتة
        this.cache.starBuffer = {
            geometry: geometry,
            material: material,
            count: maxStars,
            lastUpdate: Date.now()
        };
    }
    
    calculateDynamicStarSize(star) {
        // حساب الحجم الديناميكي بناءً على:
        // 1. القدر الظاهري
        // 2. النوع الطيفي
        // 3. المسافة
        
        let baseSize = 1.5;
        
        // تعديل حسب القدر الظاهري
        const magAdjustment = 3.0 - star.magnitude; // النجوم الأكثر سطوعاً أكبر
        baseSize *= (1.0 + magAdjustment * 0.3);
        
        // تعديل حسب النوع الطيفي
        const spectralType = star.spectralType?.charAt(0) || 'G';
        switch(spectralType) {
            case 'O': case 'B': baseSize *= 1.3; break; // نجوم زرقاء كبيرة
            case 'M': case 'R': case 'N': case 'S': baseSize *= 0.8; break; // نجوم حمراء صغيرة
            default: baseSize *= 1.0;
        }
        
        // الحد الأدنى والأقصى للحجم
        return Math.max(0.5, Math.min(8.0, baseSize));
    }
    
    calculateStarAlpha(star) {
        // حساب الشفافية بناءً على:
        // 1. القدر الظاهري
        // 2. الارتفاع فوق الأفق
        
        let alpha = 1.0;
        
        // النجوم الخافتة أكثر شفافية
        if (star.magnitude > 4.0) {
            alpha = 0.8 - (star.magnitude - 4.0) * 0.15;
        }
        
        // النجوم قرب الأفق أكثر شفافية
        if (star.altitude < 20) {
            alpha *= (star.altitude + 10) / 30;
        }
        
        return Math.max(0.1, Math.min(1.0, alpha));
    }
    
    createConstellationLines() {
        // تنظيف الخطوط القديمة
        this.constellationLines.forEach(line => {
            this.scene.remove(line);
        });
        this.constellationLines = [];
        
        // الحصول على خطوط الكوكبات
        const linesData = this.astroBridge.getConstellationLines();
        
        linesData.forEach(lineData => {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(lineData.from.x, lineData.from.y, lineData.from.z),
                new THREE.Vector3(lineData.to.x, lineData.to.y, lineData.to.z)
            ]);
            
            const material = new THREE.LineBasicMaterial({
                color: lineData.color,
                transparent: true,
                opacity: lineData.opacity,
                linewidth: 1.5
            });
            
            const line = new THREE.Line(geometry, material);
            line.name = `constellation-line-${lineData.constellation}`;
            this.scene.add(line);
            this.constellationLines.push(line);
        });
        
        console.log(`📐 تم إنشاء ${this.constellationLines.length} خط كوكبة`);
    }
    
    addStarsToScene() {
        if (this.starPoints) {
            this.scene.add(this.starPoints);
            console.log(`⭐ تم إضافة ${this.cache.starBuffer.count} نجمة إلى المشهد`);
        }
    }
    
    update(time, cameraPosition) {
        // تحديث توهج النجوم
        if (this.starPoints && this.starPoints.material.uniforms.time) {
            this.starPoints.material.uniforms.time.value = time * 0.001;
        }
        
        // تحديث LOD بناءً على موقع الكاميرا
        this.updateLOD(cameraPosition);
        
        // تحديث دوري للمواقع (كل 30 ثانية)
        const now = Date.now();
        if (now - this.cache.lastUpdate > 30000) {
            this.updateStarPositions();
            this.cache.lastUpdate = now;
        }
    }
    
    updateLOD(cameraPosition) {
        // تحديث مستوى التفاصيل بناءً على بعد الكاميرا
        if (!this.cache.lastPosition) {
            this.cache.lastPosition = cameraPosition.clone();
            return;
        }
        
        const distance = cameraPosition.distanceTo(this.cache.lastPosition);
        if (distance > this.settings.lodDistance) {
            // إعادة حساب LOD
            this.cache.lastPosition = cameraPosition.clone();
            
            // يمكن هنا تغيير كثافة النجوم حسب البعد
            if (distance > 300) {
                this.settings.maxStars = 2000;
            } else {
                this.settings.maxStars = 5000;
            }
        }
    }
    
    updateStarPositions() {
        // تحديث مواقع النجوم حسب الوقت الحالي
        const starData = this.astroBridge.calculatePositions(
            new Date(),
            currentLatitude,
            45.0,
            localSiderealTime
        );
        
        // تحديث المواقع في BufferGeometry
        if (this.starPoints && starData.length > 0) {
            const positions = this.starPoints.geometry.attributes.position.array;
            const alphas = this.starPoints.geometry.attributes.alpha.array;
            
            const maxStars = Math.min(starData.length, this.cache.starBuffer.count);
            
            for (let i = 0; i < maxStars; i++) {
                const star = starData[i];
                const baseIndex = i * 3;
                
                // تحديث المواقع
                positions[baseIndex] = star.x;
                positions[baseIndex + 1] = star.y;
                positions[baseIndex + 2] = star.z;
                
                // تحديث الشفافية
                alphas[i] = this.calculateStarAlpha(star);
            }
            
            // تحديث الـ Buffer
            this.starPoints.geometry.attributes.position.needsUpdate = true;
            this.starPoints.geometry.attributes.alpha.needsUpdate = true;
            
            // تحديث خطوط الكوكبات
            this.updateConstellationLines(starData);
            
            // تحديث العرض
            this.updateStarCountDisplay(maxStars);
        }
    }
    
    updateConstellationLines(starData) {
        // تحديث خطوط الكوكبات بناءً على المواقع الجديدة
        // (هذا يتطلب بحثاً مطابقاً للنجوم، يمكن تحسينه)
    }
    
    updateStarCountDisplay(count) {
        // تحديث عرض عدد النجوم في HUD
        const starCountElement = document.getElementById('starCountDisplay');
        if (starCountElement) {
            starCountElement.textContent = `النجوم المرئية: ${count}`;
        }
    }
    
    setStarBrightness(brightness) {
        this.settings.starBrightness = brightness;
        if (this.starPoints && this.starPoints.material.uniforms.brightness) {
            this.starPoints.material.uniforms.brightness.value = brightness;
        }
    }
    
    setStarSize(size) {
        this.settings.starSizeMultiplier = size;
        if (this.starPoints && this.starPoints.material.uniforms.sizeMultiplier) {
            this.starPoints.material.uniforms.sizeMultiplier.value = size;
        }
    }
    
    toggleConstellations(show) {
        this.settings.showConstellations = show;
        this.constellationLines.forEach(line => {
            line.visible = show;
        });
    }
    
    dispose() {
        // تنظيف الذاكرة
        if (this.starPoints) {
            this.scene.remove(this.starPoints);
            this.starPoints.geometry.dispose();
            this.starPoints.material.dispose();
        }
        
        this.constellationLines.forEach(line => {
            this.scene.remove(line);
            line.geometry.dispose();
            line.material.dispose();
        });
        
        this.constellationLines = [];
    }
}

// تصدير للاستخدام العام
window.RealStarsRenderer = RealStarsRenderer;