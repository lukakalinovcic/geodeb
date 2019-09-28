function rainbowProgress(i, n) {
    return rainbow((i + 0.5) / n);
}

function rainbow(f) {
    var lo = 415;
    var hi = 660;
    var wavelength = lo + (hi - lo) * f;
    return wavelengthToRGB(wavelength);
}

function lightRainbow(f) {
    return rainbow(f).map(function(x) { return 255 * 0.8 + x * 0.2; });
}

function wavelengthToRGB(wavelength){
    var xyz = cie1931WavelengthToXYZFit(wavelength);
    var rgb = srgbXYZ2RGB(xyz);
    return [rgb[0] * 255, rgb[1] * 255, rgb[2] * 255]
}

function srgbXYZ2RGB(xyz) {
    var x = xyz[0];
    var y = xyz[1];
    var z = xyz[2];

    var rl =  3.2406255 * x + -1.537208  * y + -0.4986286 * z;
    var gl = -0.9689307 * x +  1.8757561 * y +  0.0415175 * z;
    var bl =  0.0557101 * x + -0.2040211 * y +  1.0569959 * z;

    return [srgbXYZ2RGBPostprocess(rl),
            srgbXYZ2RGBPostprocess(gl),
            srgbXYZ2RGBPostprocess(bl)];
}

function srgbXYZ2RGBPostprocess(c) {
    c = c > 1 ? 1 : (c < 0 ? 0 : c);
    c = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1. / 2.4) - 0.055;
    return c;
}

function cie1931WavelengthToXYZFit(wavelength) {
    var wave = wavelength;
    var x;
    {
        var t1 = (wave - 442.0) * ((wave < 442.0) ? 0.0624 : 0.0374);
        var t2 = (wave - 599.8) * ((wave < 599.8) ? 0.0264 : 0.0323);
        var t3 = (wave - 501.1) * ((wave < 501.1) ? 0.0490 : 0.0382);
        x =   0.362 * Math.exp(-0.5 * t1 * t1)
            + 1.056 * Math.exp(-0.5 * t2 * t2)
            - 0.065 * Math.exp(-0.5 * t3 * t3);
    }

    var y;
    {
        var t1 = (wave - 568.8) * ((wave < 568.8) ? 0.0213 : 0.0247);
        var t2 = (wave - 530.9) * ((wave < 530.9) ? 0.0613 : 0.0322);

        y =   0.821 * Math.exp(-0.5 * t1 * t1)
            + 0.286 * Math.exp(-0.5 * t2 * t2);
    }

    var z;
    {
        var t1 = (wave - 437.0) * ((wave < 437.0) ? 0.0845 : 0.0278);
        var t2 = (wave - 459.0) * ((wave < 459.0) ? 0.0385 : 0.0725);

        z =   1.217 * Math.exp(-0.5 * t1 * t1)
            + 0.681 * Math.exp(-0.5 * t2 * t2);
    }

    return [x, y, z];
}
