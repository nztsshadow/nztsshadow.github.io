var txtLib = {
    parse: function(data){
        var txt = data.slice(0, -2).split("\r\n");
        var labels = txt.shift().split("\t");
        var tmp = {};
        var f = /(expansion|null)/i;
        
        for(var i = 0; txt.length > i; i++){
            var line = txt[i].split("\t");
            
            if(line[0].match(f))
                continue;
            
            tmp[line[0]] = {};
            
            for(var j = 1; line.length > j; j++)
                tmp[line[0]][labels[j]] = line[j];
        }
        
        return tmp;
    }
};