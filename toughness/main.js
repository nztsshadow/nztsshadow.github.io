window.onload = initialize;
var monLevels;
var monStats;

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
            document.getElementById("calc").style.display = "inline-block";
            
            loadCalcValues();
        }
    });
}

function monRegenFormat(arr){
    var a = [];
    for(var k of arr){
        a.push(k.toFixed(2) + " /s<sub>" + (k / 25).toFixed(2) + " /F</sub>");
    }
    return a;
}

function setCalcs(){
    loadCalcs();
}

function doCalcs(){
    //Fetch calc values.
    var minHP = parseFloat(document.getElementById("minhp").value);
    var maxHP = parseFloat(document.getElementById("maxhp").value);
    var monHP = parseFloat(document.getElementById("monhp").value);
    var physRes = parseFloat(document.getElementById("physr").value);
    var magiRes = parseFloat(document.getElementById("magir").value);
    var fireRes = parseFloat(document.getElementById("firer").value);
    var liteRes = parseFloat(document.getElementById("liter").value);
    var coldRes = parseFloat(document.getElementById("coldr").value);
    var poisRes = parseFloat(document.getElementById("poisr").value);
    var playerAR = parseFloat(document.getElementById("par").value);
    var playerDef = parseFloat(document.getElementById("pdef").value);
    var playerLvl = parseFloat(document.getElementById("plvl").value);
    var monsDef = parseFloat(document.getElementById("monsdef").value);
    var monlDef = parseFloat(document.getElementById("monldef").value);
    var monLvl = parseFloat(document.getElementById("mlvl").value);
    var monBlock = parseFloat(document.getElementById("monblock").value);
    var monRegen = parseFloat(document.getElementById("monregen").value);
    var monLAR = parseFloat(document.getElementById("monlar").value);
    var monA1AR = parseFloat(document.getElementById("mona1ar").value);
    var monA2AR = parseFloat(document.getElementById("mona2ar").value);
    var monS1AR = parseFloat(document.getElementById("mons1ar").value);
    var monDmg = parseFloat(document.getElementById("mondmg").value);
    var monA1MinDmg = parseFloat(document.getElementById("mona1mindmg").value);
    var monA1MaxDmg = parseFloat(document.getElementById("mona1maxdmg").value);
    var monA2MinDmg = parseFloat(document.getElementById("mona2mindmg").value);
    var monA2MaxDmg = parseFloat(document.getElementById("mona2maxdmg").value);
    var monS1MinDmg = parseFloat(document.getElementById("mons1mindmg").value);
    var monS1MaxDmg = parseFloat(document.getElementById("mons1maxdmg").value);
    
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
    document.getElementById("minhpo").innerText = realMinHP;
    document.getElementById("maxhpo").innerText = realMaxHP;
    
    //Set Chance to Hit
    document.getElementById("defc").innerText = chanceToHit;
    
    //Set Calculated Toughness'
    document.getElementById("physro").innerText = physTough.isInf().join(" - ");
    document.getElementById("magiro").innerText = magiTough.isInf().join(" - ");
    document.getElementById("firero").innerText = fireTough.isInf().join(" - ");
    document.getElementById("litero").innerText = liteTough.isInf().join(" - ");
    document.getElementById("coldro").innerText = coldTough.isInf().join(" - ");
    document.getElementById("poisro").innerText = poisTough.isInf().join(" - ");
    
    //Set Monster Regen Range
    document.getElementById("monregeno").innerText = monRegenScale.doFormat("regen").join(" ~ ");
    
    //Set Chance to be Hit A1/A2
    document.getElementById("pdefc").innerText = chanceToBeHit.suffix("%").join(" | ");
    
    //Set A1/A2/S1 Damage
    document.getElementById("mona1dmgo").innerText = A1Dmg.join(" ~ ");
    document.getElementById("mona2dmgo").innerText = A2Dmg.join(" ~ ");
    document.getElementById("mons1dmgo").innerText = S1Dmg.join(" ~ ");
}

function loadCalcs(clear){
    
    //Elements
    var mDiff = document.getElementById("diff");
    var mMon = document.getElementById("mon");
    var mLvl = document.getElementById("mlvl");
    
    //Fetch selected values.
    var sDiff = mDiff.value;
    var sMon = mMon.value;
    var sLvl = mLvl.value;
    
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
            document.getElementById(k).value = parseInt(monStats[sMon][nk] == "" ? 0 : monStats[sMon][nk]);
        
        if(f == 1)
            document.getElementById(k).value = parseInt(monLevels[sLvl][nk] == "" ? 0 : monLevels[sLvl][nk]);
    }
    
    doCalcs();
}

function loadCalcValues(){
    //Elements
    var mLvl = document.getElementById("mlvl");
    var mMon = document.getElementById("mon");
    
    //Clear out mlvl/mon
    mLvl.innerHTML = "";
    mMon.innerHTML = "";
    
    //Sort monsters in alphabetical order.
    var monStatKeys = Object.keys(monStats);
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
    
    loadCalcs();
}

function initialize(){
    document.getElementById("monstatsf").addEventListener("change", handleTxt, false);
    document.getElementById("monlvlf").addEventListener("change", handleTxt, false);
    document.getElementById("mlvl").addEventListener("change", setCalcs, false);
    document.getElementById("mon").addEventListener("change", setCalcs, false);
    document.getElementById("diff").addEventListener("change", setCalcs, false);
    document.getElementById("plvl").addEventListener("keyup", setCalcs, false);
    
    //Listen for editable calc changes.
    for(var k of calcs){
        document.getElementById(k).addEventListener("keyup", function(){
            return doCalcs();
        }, false);
    }
}
