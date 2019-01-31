var isMale;
var resetFlag = false;

var decimalHalves;

var units = ["", "", "", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
var tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
var hundreds = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];
var thousands = ["", "mil", "milh", "bilh", "trilh"];


function SetGrammaticalGender(useMale)
{
    if (useMale)
    {
        units[1] = "um";
        units[2] = "dois";

        for (var i = 2; i < hundreds.length; i++)
        {
            var hundred = hundreds[i];
            hundreds[i] = hundred.substr(0, hundred.length - 2) + "os";
        }
    }
    else
    {
        units[1] = "uma";
        units[2] = "duas";

        for (var i = 2; i < hundreds.length; i++)
        {
            var hundred = hundreds[i];
            hundreds[i] = hundred.substr(0, hundred.length - 2) + "as";
        }
    }
}

function Execute()
{
	if (resetFlag)
	{
		document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
		resetFlag = false;
	}
	
	var generatedNum = FindCookie("generated_num");
	var generatedVerbal = FindCookie("generated_verbal");
	
	
	if (generatedNum.length > 0 && generatedVerbal.length > 0)
	{
		document.getElementById("numerical").innerHTML = generatedNum;
		document.getElementById("verbal").innerHTML = generatedVerbal;
		
		resetFlag = true;
	}
	else
	{
		var min = Number(document.getElementById("Min").innerHTML);
		var max = Number(document.getElementById("Max").innerHTML);
		var decimalPlaces = Number(document.getElementById("NumberDecimalPlaces").innerHTML);
		var isMale = document.getElementById("IsMale").innerHTML;
		var isPrice = document.getElementById("IsPrice").innerHTML;
		
		isMale.length > 0 ? SetGrammaticalGender(true) : SetGrammaticalGender(false);
		
		GenerateNumber(min, max, decimalPlaces);
		StartNumberParse();
	}
}

function GenerateNumber(min, max, decimalPlaces)
{
    var rand = Math.random() * (max - min) + min;
    var powerOfTen = Math.pow(10, decimalPlaces);
    var decimal = Math.floor(rand * powerOfTen) / powerOfTen;

	document.getElementById("numerical").innerHTML = decimal;
    document.cookie = "generated_num=" + decimal + ";";
}

function StartNumberParse()
{
    var num = FindCookie("generated_num");
    decimalHalves = num.split(".");
	
	var verbal = ParseLeftHand(decimalHalves[0], 0, "") + ParseRightHand(decimalHalves[1]);
	document.getElementById("verbal").innerHTML = verbal;
	document.cookie = "generated_verbal=" + verbal + ";";
}

function GetPeriodLabel(period, triplet)
{
	if (triplet === 0)
	{
		return "";
	}
	
    if (period <= 1)
    {
        return thousands[period];
    }
    else
    {
        var suffix = triplet <= 1 ? "ão" : "ões";
        return thousands[period] + suffix;
    }
}

function ParseRightHand(digitsStr)
{	
	if (digitsStr.length === 0)
	{
		return "";
	}
	
	var result = "";
	
	for (var i = 0; i < digitsStr.length; i++)
	{
		var digitStr = digitsStr.charAt(i);
		var index = Number(digitStr);
		result = result + " " + units[index];
	}
	
	result = " vírgula " + result;
	
	return result;
}

function ParseLeftHand(digits, period, passedString)
{
	digits = parseInt(digits);
	
    if (period === 0 && digits === 0)
    {
        return "zero";
    }
    else if (digits === 0)
    {
        // In this case the string either starts with " e " or ", ".
		var prunedResult = passedString.substr(2).trim();
        return prunedResult;
    }
    else
    {
        if (period >= 2)
        {
            SetGrammaticalGender(true);
        }

        var triplet = digits % 1000;
        var inProgressString = GetPeriodLabel(period, triplet);

        if (triplet === 100)
        {
            passedString = "cem" + inProgressString;
        }
        else if (period != 1 || triplet != 1)
        {
            var firstDig = triplet % 10;
            var secondDig = Math.trunc((triplet / 10) % 10);
            var thirdDig = Math.trunc((triplet / 100) % 10);

            var hundred = hundreds[thirdDig];

            if (secondDig < 2)
            {
                var unit = units[secondDig * 10 + firstDig];
                unit = unit !== "" && thirdDig > 0 ? (" e " + unit) : unit;

                inProgressString = hundred + unit + " " + inProgressString;
            }
            else
            {
                var unit = units[firstDig];
                unit = unit !== "" && (thirdDig > 0 || secondDig > 0) ? (" e " + unit) : unit;

                var ten = tens[secondDig];
                ten = ten !== "" && thirdDig > 0 ? (" e " + ten) : ten;

                inProgressString = hundred + ten + unit + " " + inProgressString;
            }
        }

		
		if (triplet > 0)
		{
			if (period === 0 && (triplet <= 100 || triplet % 100 === 0))
			{
				inProgressString = " e " + inProgressString;
			}
			else
			{
				inProgressString = ", " + inProgressString;
			}
			
		}

        return ParseLeftHand(Math.trunc(digits / 1000), period + 1, inProgressString + passedString)
    }
}

function FindCookie(name)
{
  var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match)
  {
	  return match[2];
  }
  else
  {
	  return "";
  }
}

Execute();