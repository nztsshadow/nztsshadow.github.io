window.onload = initialize;
var monLevels;
var monStats;

HTMLElement.prototype.setAttributes = function(){
    if((arguments.length > 0) && (arguments.length % 2 == 0))
        for(var i = 0; arguments.length > i; i+=2)
            this.setAttribute(arguments[i], arguments[i+1]);
}

Array.prototype.suffix = function(suf){
    var a = [];
    for(var k of this)
        a.push(k + suf);
    return a;
}

Array.prototype.doFormat = function(format){
    switch(format){
        case "regen": return monRegenFormat(this); break;
    }
}

Array.prototype.isInf = function(){
    if(this[0] >= 0 && this[1] >= 0 && this[0] != Infinity && this[1] != Infinity)
        return this;
    return ["Immune"];
}

Number.prototype.capOff = function(){
    return this >= 95 ? 95 : this == 0 ? 0 : this <= 5 ? 5 : this;
}

var calcs = [
    "minhp",
    "maxhp",
    "monhp",
    "monregen",
    "monsdef",
    "monldef",
    "monblock",
    "moncrit",
    "mona1ar",
    "mona2ar",
    "monlar",
    "mona1mindmg",
    "mona1maxdmg",
    "mona2mindmg",
    "mona2maxdmg",
    "mons1mindmg",
    "mons1maxdmg",
    "mondmg",
    "physr",
    "magir",
    "firer",
    "liter",
    "coldr",
    "poisr",
    "par",
    "pdef"
];

function readFile(f, c){
    var fileRead = new FileReader();
    var data = fileRead.readAsText(f.target.files[0]);
    
    fileRead.onload = function(c, fse, fle){
        return c(fse, fle);
    }.bind(null, c, f);
}

function handleTxt(fs){
    readFile(fs, function(fse, fle){
        var data = fle.target.result;
        var filename = fse.target.files[0].name.toLowerCase();
        
        switch(filename){
            case "monlvl.txt":
                if(data.substring(0, 6) != "Level\t")
                    return alert("This is not a valid MonLvl.txt");
                
                monLevels = txtLib.parse(data);
                break;
            case "monstats.txt":
                if(data.substring(0, 3) != "Id\t")
                    return alert("This is not a valid MonStats.txt");
                
                monStats = txtLib.parse(data);
                break;
            default:
                return alert("This file is not supported.");
                break;
        }
        
        if(monLevels && monStats){
            document.getElementById("upload").style.display = "none";
            document.getElementById("calc_a").style.display = "inline-block";
            document.getElementById("calc_b").style.display = "inline-block";
            
            loadCalcValues(true, true, "a");
            loadCalcValues(true, true, "b");
        }
    });
}

function monRegenFormat(arr){
    var a = [];
    for(var k of arr){
        a.push(k.toFixed(2) + "<sup>/s</sup> <sub>" + (k / 25).toFixed(2) + "/f</sub>");
    }
    return a;
}

function setCalcsA(){
    loadCalcs(false, "a");
}

function setCalcsB(){
    loadCalcs(false, "b");
}

function setMonCalcsA(){
    loadCalcs(true, "a");
}

function setMonCalcsB(){
    loadCalcs(true, "b");
}

function setSortA(){
    var mode = parseInt(this.value);
    switch(mode){
        case 0: loadCalcValues(true, false, "a"); break;
        case 1: loadCalcValues(false, false, "a"); break;
    }
}

function setSortB(){
    var mode = parseInt(this.value);
    switch(mode){
        case 0: loadCalcValues(true, false, "b"); break;
        case 1: loadCalcValues(false, false, "b"); break;
    }
}

function doCalcs(pCalc){
    //Fetch calc values.
    var minHP = parseFloat(document.getElementById("minhp_"+pCalc).value);
    var maxHP = parseFloat(document.getElementById("maxhp_"+pCalc).value);
    var monHP = parseFloat(document.getElementById("monhp_"+pCalc).value);
    var physRes = parseFloat(document.getElementById("physr_"+pCalc).value);
    var magiRes = parseFloat(document.getElementById("magir_"+pCalc).value);
    var fireRes = parseFloat(document.getElementById("firer_"+pCalc).value);
    var liteRes = parseFloat(document.getElementById("liter_"+pCalc).value);
    var coldRes = parseFloat(document.getElementById("coldr_"+pCalc).value);
    var poisRes = parseFloat(document.getElementById("poisr_"+pCalc).value);
    var playerAR = parseFloat(document.getElementById("par_"+pCalc).value);
    var playerDef = parseFloat(document.getElementById("pdef_"+pCalc).value);
    var playerLvl = parseFloat(document.getElementById("plvl_"+pCalc).value);
    var monsDef = parseFloat(document.getElementById("monsdef_"+pCalc).value);
    var monlDef = parseFloat(document.getElementById("monldef_"+pCalc).value);
    var monLvl = parseFloat(document.getElementById("mlvl_"+pCalc).value);
    var monBlock = parseFloat(document.getElementById("monblock_"+pCalc).value);
    var monRegen = parseFloat(document.getElementById("monregen_"+pCalc).value);
    var monLAR = parseFloat(document.getElementById("monlar_"+pCalc).value);
    var monA1AR = parseFloat(document.getElementById("mona1ar_"+pCalc).value);
    var monA2AR = parseFloat(document.getElementById("mona2ar_"+pCalc).value);
    var monS1AR = parseFloat(document.getElementById("mons1ar_"+pCalc).value);
    var monDmg = parseFloat(document.getElementById("mondmg_"+pCalc).value);
    var monA1MinDmg = parseFloat(document.getElementById("mona1mindmg_"+pCalc).value);
    var monA1MaxDmg = parseFloat(document.getElementById("mona1maxdmg_"+pCalc).value);
    var monA2MinDmg = parseFloat(document.getElementById("mona2mindmg_"+pCalc).value);
    var monA2MaxDmg = parseFloat(document.getElementById("mona2maxdmg_"+pCalc).value);
    var monS1MinDmg = parseFloat(document.getElementById("mons1mindmg_"+pCalc).value);
    var monS1MaxDmg = parseFloat(document.getElementById("mons1maxdmg_"+pCalc).value);
    
    //Calculate Real HP Range
    var realMinHP = (minHP * monHP) / 100;
    var realMaxHP = (maxHP * monHP) / 100;
    
    //Calculate Monster Regen
    var monRegenScale = [(((monRegen * realMinHP) / 4096) * 25), (((monRegen * realMaxHP) / 4096) * 25)];
    
    //Calculate To Hit
    var monDef = (monsDef * monlDef) / 100;
    var chanceToHit = Math.round((2 * ((playerAR / (playerAR + monDef)) * (playerLvl / (playerLvl + monLvl)))) * 100).capOff(); 
    
    //Calculate To Be Hit A1
    var monA1TH = (monA1AR * monLAR) / 100;
    var chanceToBeHitA1 = Math.round((2 * ((monA1TH / (monA1TH + playerDef)) * (monLvl / (monLvl + playerLvl)))) * 100).capOff();
    
    //Calculate To Be Hit A2
    var monA2TH = (monA2AR * monLAR) / 100;
    var chanceToBeHitA2 = Math.round((2 * ((monA2TH / (monA2TH + playerDef)) * (monLvl / (monLvl + playerLvl)))) * 100).capOff();
    
    //Calculate To Be Hit S1
    var monS1TH = (monS1AR * monLAR) / 100;
    var chanceToBeHitS1 = Math.round((2 * ((monS1TH / (monS1TH + playerDef)) * (monLvl / (monLvl + playerLvl)))) * 100).capOff();
    
    //Total chances to be hit
    var chanceToBeHit = [chanceToBeHitA1, chanceToBeHitA2, chanceToBeHitS1];
    
    //Calculate Damage A1
    var minA1Dmg = (monA1MinDmg * monDmg) / 100;
    var maxA1Dmg = (monA1MaxDmg * monDmg) / 100;
    var A1Dmg = [minA1Dmg, maxA1Dmg];
    
    //Calculate Damage A2
    var minA2Dmg = (monA2MinDmg * monDmg) / 100;
    var maxA2Dmg = (monA2MaxDmg * monDmg) / 100;
    var A2Dmg = [minA2Dmg, maxA2Dmg];
    
    //Calculate Damage S1
    var minS1Dmg = (monS1MinDmg * monDmg) / 100;
    var maxS1Dmg = (monS1MaxDmg * monDmg) / 100;
    var S1Dmg = [minS1Dmg, maxS1Dmg];
    
    //Calculate Monster Toughness'
    var physTough = [Math.round(realMinHP * (100 / (100 - physRes) )), Math.round(realMaxHP * (100 / (100 - physRes) ))];
    var magiTough = [Math.round(realMinHP * (100 / (100 - magiRes) )), Math.round(realMaxHP * (100 / (100 - magiRes) ))];
    var fireTough = [Math.round(realMinHP * (100 / (100 - fireRes) )), Math.round(realMaxHP * (100 / (100 - fireRes) ))];
    var liteTough = [Math.round(realMinHP * (100 / (100 - liteRes) )), Math.round(realMaxHP * (100 / (100 - liteRes) ))];
    var coldTough = [Math.round(realMinHP * (100 / (100 - coldRes) )), Math.round(realMaxHP * (100 / (100 - coldRes) ))];
    var poisTough = [Math.round(realMinHP * (100 / (100 - poisRes) )), Math.round(realMaxHP * (100 / (100 - poisRes) ))];
    
    //Set Real HP values.
    document.getElementById("minhpo_"+pCalc).innerText = realMinHP;
    document.getElementById("maxhpo_"+pCalc).innerText = realMaxHP;
    
    //Set Chance to Hit
    document.getElementById("defc_"+pCalc).innerText = chanceToHit;
    
    //Set Calculated Toughness'
    var calcPhysTough = physTough.isInf();
    var calcMagiTough = magiTough.isInf();
    var calcFireTough = fireTough.isInf();
    var calcLiteTough = liteTough.isInf();
    var calcColdTough = coldTough.isInf();
    var calcPoisTough = poisTough.isInf();
    
    document.getElementById("physrocalc_"+pCalc).innerText = calcPhysTough.join(" - ");
    document.getElementById("magirocalc_"+pCalc).innerText = calcMagiTough.join(" - ");
    document.getElementById("firerocalc_"+pCalc).innerText = calcFireTough.join(" - ");
    document.getElementById("literocalc_"+pCalc).innerText = calcLiteTough.join(" - ");
    document.getElementById("coldrocalc_"+pCalc).innerText = calcColdTough.join(" - ");
    document.getElementById("poisrocalc_"+pCalc).innerText = calcPoisTough.join(" - ");
    
    //Quantify Toughness
    document.getElementById("physro_"+pCalc).setAttributes("range-min", calcPhysTough[0], "range-max", calcPhysTough[1]);
    document.getElementById("magiro_"+pCalc).setAttributes("range-min", calcMagiTough[0], "range-max", calcMagiTough[1]);
    document.getElementById("firero_"+pCalc).setAttributes("range-min", calcFireTough[0], "range-max", calcFireTough[1]);
    document.getElementById("litero_"+pCalc).setAttributes("range-min", calcLiteTough[0], "range-max", calcLiteTough[1]);
    document.getElementById("coldro_"+pCalc).setAttributes("range-min", calcColdTough[0], "range-max", calcColdTough[1]);
    document.getElementById("poisro_"+pCalc).setAttributes("range-min", calcPoisTough[0], "range-max", calcPoisTough[1]);
    
    //Set Monster Regen Range
    document.getElementById("monregeno_"+pCalc).innerHTML = monRegenScale.doFormat("regen").join(" ~ ");
    
    //Set Chance to be Hit A1/A2
    document.getElementById("pdefc_"+pCalc).innerText = chanceToBeHit.suffix("%").join(" | ");
    
    //Set A1/A2/S1 Damage
    document.getElementById("mona1dmgo_"+pCalc).innerText = A1Dmg.join(" ~ ");
    document.getElementById("mona2dmgo_"+pCalc).innerText = A2Dmg.join(" ~ ");
    document.getElementById("mons1dmgo_"+pCalc).innerText = S1Dmg.join(" ~ ");
}

function loadCalcs(useMon, pCalc){
    
    //Elements
    var mDiff = document.getElementById("diff_"+pCalc);
    var mMon = document.getElementById("mon_"+pCalc);
    var mLvl = document.getElementById("mlvl_"+pCalc);
    
    //Fetch selected values.
    var sDiff = mDiff.value;
    var sMon = mMon.value;
    var sLvl = mLvl.value;
    
    //Set MonStats monlvl on monster load
    if(useMon){
        monLevelKey = sDiff == 1 ? "Level(N)" : sDiff == 2 ? "Level(H)" : "Level";
        sLvl = parseInt(monStats[sMon][monLevelKey] == "" ? mLvl.value : monStats[sMon][monLevelKey]);
        mLvl.value = sLvl;
    }
    
    //Fill appropriate values.
    for(var k of calcs){
        var nk;
        var f = -1;
        
        switch(k){
            case "minhp": f = 0; nk = sDiff == 1 ? "MinHP(N)" : sDiff == 2 ? "MinHP(H)" : "minHP"; break;
            case "maxhp": f = 0; nk = sDiff == 1 ? "MaxHP(N)" : sDiff == 2 ? "MaxHP(H)" : "maxHP"; break;
            case "monhp": f = 1; nk = sDiff == 1 ?  "L-HP(N)" : sDiff == 2 ?  "L-HP(H)" :  "L-HP"; break;
            case "monregen": f = 0; nk = "DamageRegen"; break;
            case "moncrit": f = 0; nk = "Crit"; break;
            case "monsdef": f = 0; nk = sDiff == 1 ? "AC(N)" : sDiff == 2 ? "AC(H)" : "AC"; break;
            case "monldef": f = 1; nk = sDiff == 1 ? "L-AC(N)" : sDiff == 2 ?  "L-AC(H)" :  "L-AC"; break;
            case "monblock": f = 0; nk = sDiff == 1 ? "ToBlock(N)" : sDiff == 2 ?  "ToBlock(H)" :  "ToBlock"; break;
            case "mona1ar": f = 0; nk = sDiff == 1 ? "A1TH(N)" : sDiff == 2 ? "A1TH(H)" : "A1TH"; break;
            case "mona2ar": f = 0; nk = sDiff == 1 ? "A2TH(N)" : sDiff == 2 ? "A2TH(H)" : "A2TH"; break;
            case "mons1ar": f = 0; nk = sDiff == 1 ? "S1TH(N)" : sDiff == 2 ? "S1TH(H)" : "S1TH"; break;
            case "monlar": f = 1; nk = sDiff == 1 ?  "L-TH(N)" : sDiff == 2 ?  "L-TH(H)" :  "L-TH"; break;
            case "mona1mindmg": f = 0; nk = sDiff == 1 ? "A1MinD(N)" : sDiff == 2 ? "A1MinD(H)" : "A1MinD"; break;
            case "mona1maxdmg": f = 0; nk = sDiff == 1 ? "A1MaxD(N)" : sDiff == 2 ? "A1MaxD(H)" : "A1MaxD"; break;
            case "mona2mindmg": f = 0; nk = sDiff == 1 ? "A2MinD(N)" : sDiff == 2 ? "A2MinD(H)" : "A2MinD"; break;
            case "mona2maxdmg": f = 0; nk = sDiff == 1 ? "A2MaxD(N)" : sDiff == 2 ? "A2MaxD(H)" : "A2MaxD"; break;
            case "mons1mindmg": f = 0; nk = sDiff == 1 ? "S1MinD(N)" : sDiff == 2 ? "S1MinD(H)" : "S1MinD"; break;
            case "mons1maxdmg": f = 0; nk = sDiff == 1 ? "S1MaxD(N)" : sDiff == 2 ? "S1MaxD(H)" : "S1MaxD"; break;
            case "mondmg": f = 1; nk = sDiff == 1 ?  "L-DM(N)" : sDiff == 2 ?  "L-DM(H)" :  "L-DM"; break;
            case "physr": f = 0; nk = sDiff == 1 ? "ResDm(N)" : sDiff == 2 ? "ResDm(H)" : "ResDm"; break;
            case "magir": f = 0; nk = sDiff == 1 ? "ResMa(N)" : sDiff == 2 ? "ResMa(H)" : "ResMa"; break;
            case "firer": f = 0; nk = sDiff == 1 ? "ResFi(N)" : sDiff == 2 ? "ResFi(H)" : "ResFi"; break;
            case "liter": f = 0; nk = sDiff == 1 ? "ResLi(N)" : sDiff == 2 ? "ResLi(H)" : "ResLi"; break;
            case "coldr": f = 0; nk = sDiff == 1 ? "ResCo(N)" : sDiff == 2 ? "ResCo(H)" : "ResCo"; break;
            case "poisr": f = 0; nk = sDiff == 1 ? "ResPo(N)" : sDiff == 2 ? "ResPo(H)" : "ResPo"; break;
        }
        
        if(f == -1)
            continue;
        
        if(f == 0)
            document.getElementById(k+"_"+pCalc).value = parseInt(monStats[sMon][nk] == "" ? 0 : monStats[sMon][nk]);
        
        if(f == 1)
            document.getElementById(k+"_"+pCalc).value = parseInt(monLevels[sLvl][nk] == "" ? 0 : monLevels[sLvl][nk]);
    }
    
    doCalcs(pCalc);
}

function loadCalcValues(sort, update, pCalc){
    //Elements
    var mLvl = document.getElementById("mlvl_"+pCalc);
    var mMon = document.getElementById("mon_"+pCalc);
    
    //Clear out mlvl/mon
    mLvl.innerHTML = "";
    mMon.innerHTML = "";
    
    //Sort monsters in alphabetical order.
    var monStatKeys = Object.keys(monStats);
    if(sort)
        monStatKeys.sort();
    
    //Load keys for MonLvls
    for(var k of Object.keys(monLevels)){
        var nLvl = document.createElement("option");
        nLvl.value = k;
        nLvl.innerText = k;
        mLvl.appendChild(nLvl);
    }
    
    //Load keys for MonStats
    for(var k of monStatKeys){
        var nMon = document.createElement("option");
        nMon.value = k;
        nMon.innerText = k;
        mMon.appendChild(nMon);
    }
    
    // Load Calcs after keys loaded.
    if(update)
        loadCalcs(false, pCalc);
}

function handleQuantA(e){
    var quant = e.target;
    var quantifier = parseInt(quant.value) / 100;
    
    var ranges = {
        phys: [
            parseInt(document.getElementById("physro_a").getAttribute("range-min")), 
            parseInt(document.getElementById("physro_a").getAttribute("range-max"))
        ],
        magi: [
            parseInt(document.getElementById("magiro_a").getAttribute("range-min")), 
            parseInt(document.getElementById("magiro_a").getAttribute("range-max"))
        ],
        fire: [
            parseInt(document.getElementById("firero_a").getAttribute("range-min")), 
            parseInt(document.getElementById("firero_a").getAttribute("range-max"))
        ],
        lite: [
            parseInt(document.getElementById("litero_a").getAttribute("range-min")), 
            parseInt(document.getElementById("litero_a").getAttribute("range-max"))
        ],
        cold: [
            parseInt(document.getElementById("coldro_a").getAttribute("range-min")), 
            parseInt(document.getElementById("coldro_a").getAttribute("range-max"))
        ],
        pois: [
            parseInt(document.getElementById("poisro_a").getAttribute("range-min")), 
            parseInt(document.getElementById("poisro_a").getAttribute("range-max"))
        ]
    };
    
    document.getElementById("physroq_a").innerText = [Math.floor(ranges.phys[0] * quantifier), Math.floor(ranges.phys[1] * quantifier)].isInf().join(" - ");
    document.getElementById("magiroq_a").innerText = [Math.floor(ranges.magi[0] * quantifier), Math.floor(ranges.magi[1] * quantifier)].isInf().join(" - ");
    document.getElementById("fireroq_a").innerText = [Math.floor(ranges.fire[0] * quantifier), Math.floor(ranges.fire[1] * quantifier)].isInf().join(" - ");
    document.getElementById("literoq_a").innerText = [Math.floor(ranges.lite[0] * quantifier), Math.floor(ranges.lite[1] * quantifier)].isInf().join(" - ");
    document.getElementById("coldroq_a").innerText = [Math.floor(ranges.cold[0] * quantifier), Math.floor(ranges.cold[1] * quantifier)].isInf().join(" - ");
    document.getElementById("poisroq_a").innerText = [Math.floor(ranges.pois[0] * quantifier), Math.floor(ranges.pois[1] * quantifier)].isInf().join(" - ");
    
    if(isNaN(ranges.phys[0])) document.getElementById("physroq_a").innerText = "Immune";
    if(isNaN(ranges.magi[0])) document.getElementById("magiroq_a").innerText = "Immune";
    if(isNaN(ranges.fire[0])) document.getElementById("fireroq_a").innerText = "Immune";
    if(isNaN(ranges.lite[0])) document.getElementById("literoq_a").innerText = "Immune";
    if(isNaN(ranges.cold[0])) document.getElementById("coldroq_a").innerText = "Immune";
    if(isNaN(ranges.pois[0])) document.getElementById("poisroq_a").innerText = "Immune";
    
}

function handleQuantB(e){
    var quant = e.target;
    var quantifier = parseInt(quant.value) / 100;
    
    var ranges = {
        phys: [
            parseInt(document.getElementById("physro_b").getAttribute("range-min")), 
            parseInt(document.getElementById("physro_b").getAttribute("range-max"))
        ],
        magi: [
            parseInt(document.getElementById("magiro_b").getAttribute("range-min")), 
            parseInt(document.getElementById("magiro_b").getAttribute("range-max"))
        ],
        fire: [
            parseInt(document.getElementById("firero_b").getAttribute("range-min")), 
            parseInt(document.getElementById("firero_b").getAttribute("range-max"))
        ],
        lite: [
            parseInt(document.getElementById("litero_b").getAttribute("range-min")), 
            parseInt(document.getElementById("litero_b").getAttribute("range-max"))
        ],
        cold: [
            parseInt(document.getElementById("coldro_b").getAttribute("range-min")), 
            parseInt(document.getElementById("coldro_b").getAttribute("range-max"))
        ],
        pois: [
            parseInt(document.getElementById("poisro_b").getAttribute("range-min")), 
            parseInt(document.getElementById("poisro_b").getAttribute("range-max"))
        ]
    };
    
    document.getElementById("physroq_b").innerText = [Math.floor(ranges.phys[0] * quantifier), Math.floor(ranges.phys[1] * quantifier)].isInf().join(" - ");
    document.getElementById("magiroq_b").innerText = [Math.floor(ranges.magi[0] * quantifier), Math.floor(ranges.magi[1] * quantifier)].isInf().join(" - ");
    document.getElementById("fireroq_b").innerText = [Math.floor(ranges.fire[0] * quantifier), Math.floor(ranges.fire[1] * quantifier)].isInf().join(" - ");
    document.getElementById("literoq_b").innerText = [Math.floor(ranges.lite[0] * quantifier), Math.floor(ranges.lite[1] * quantifier)].isInf().join(" - ");
    document.getElementById("coldroq_b").innerText = [Math.floor(ranges.cold[0] * quantifier), Math.floor(ranges.cold[1] * quantifier)].isInf().join(" - ");
    document.getElementById("poisroq_b").innerText = [Math.floor(ranges.pois[0] * quantifier), Math.floor(ranges.pois[1] * quantifier)].isInf().join(" - ");
    
    if(isNaN(ranges.phys[0])) document.getElementById("physroq_b").innerText = "Immune";
    if(isNaN(ranges.magi[0])) document.getElementById("magiroq_b").innerText = "Immune";
    if(isNaN(ranges.fire[0])) document.getElementById("fireroq_b").innerText = "Immune";
    if(isNaN(ranges.lite[0])) document.getElementById("literoq_b").innerText = "Immune";
    if(isNaN(ranges.cold[0])) document.getElementById("coldroq_b").innerText = "Immune";
    if(isNaN(ranges.pois[0])) document.getElementById("poisroq_b").innerText = "Immune";
    
}

function initialize(){
    document.getElementById("monstatsf").addEventListener("change", handleTxt, false);
    document.getElementById("monlvlf").addEventListener("change", handleTxt, false);
    
    // Calc A
    document.getElementById("mlvl_a").addEventListener("mouseup", setCalcsA, false);
    document.getElementById("mon_a").addEventListener("change", setMonCalcsA, false);
    document.getElementById("diff_a").addEventListener("change", setMonCalcsA, false);
    document.getElementById("sortmode_a").addEventListener("change", setSortA, false);
    document.getElementById("plvl_a").addEventListener("keyup", setCalcsA, false);
    document.getElementById("toughquant_a").addEventListener("keyup", handleQuantA, false);
    
    //Listen for editable calc changes.
    for(var k of calcs){
        document.getElementById(k+"_a").addEventListener("keyup", function(){
            return doCalcs("a");
        }, false);
    }
    
    // Calc B
    document.getElementById("mlvl_b").addEventListener("mouseup", setCalcsB, false);
    document.getElementById("mon_b").addEventListener("change", setMonCalcsB, false);
    document.getElementById("diff_b").addEventListener("change", setMonCalcsB, false);
    document.getElementById("sortmode_b").addEventListener("change", setSortB, false);
    document.getElementById("plvl_b").addEventListener("keyup", setCalcsB, false);
    document.getElementById("toughquant_b").addEventListener("keyup", handleQuantB, false);
    
    //Listen for editable calc changes.
    for(var k of calcs){
        document.getElementById(k+"_b").addEventListener("keyup", function(){
            return doCalcs("b");
        }, false);
    }
}
