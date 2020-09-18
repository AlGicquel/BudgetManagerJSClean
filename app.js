//budget controller, gere les donnees
var budgetController = (function () {
    
    //constructeur de l'objet Expense
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome >0) {
            this.percentage = Math.round((this.value / totalIncome)*100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    
    //constructeur de l'objet Income
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    //calcule les totaux
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems
        [type].forEach(function(cur) {
            sum+=cur.value;
        })
        data.totals[type] = sum;
        
    };
    
    //donnees privees
    var data = {
        allItems
        : {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    
    
    //donnees rendues public
    return {
        
        //constructeur nouvel Item
        addItem: function(type, des, val) {
            //declaration des variables
            var newItem, ID;
            
            //create new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems
                [type][data.allItems[type].length-1].id + 1;
            } else {
                ID = 0;
            }
            
            
            //create new item depending on type (inc or exp)
            if(type === 'exp'){
                newItem = new Expense (ID, des, val);
            } else if (type ==='inc') {
                newItem = new Income(ID, des, val);
            }
            
            //put the new item in the data object
            data.allItems
            [type].push(newItem);

            //renvoie l'objet cree
            return newItem;
            
        }, 
        
        //delete an item
        deleteItem: function(type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        //calcule les totaux
        calculateBudget: function () {
            
            //total of incomes and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            
            //calculate the budget (income-expenses)
            data.budget = (Math.round((data.totals.inc - data.totals.exp)*100))/100;
            
            //calculate the percentage
            if (data.totals.inc > 0) {
                data.percentage = (Math.round((data.totals.exp*100) / data.totals.inc)*100)/100;
            } else {
                data.percentage = -1;
            }
        },
        
        //calculate percentages
        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
            
        },
        
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPercentages;
        },
        
        //getter des totaux
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        //getter de toutes les datas
        getData: function() {
            return data;
        }
        
    }
    
})();





//UI controller, gere l'affichage des donnees a l'ecran
var UIController = (function () {
    
    //stockage des appelations de classe dans un objet
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        incomesLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        budgetLabel: '.budget__value',
        container: '.container', 
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    
    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec + ' €';

    };
    
    
    var nodeListForEach = function(list, callback) {
                
        for (var i = 0; i<list.length; i++) {
            callback(list[i], i);
        }
    };
    
    
    
    //donnees rendues public
    return {
        
        //donnees envoyees en appuyant sur le bouton valider
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        //ajoute un element dans les colonnes
        addListItem: function(obj, type) {
            
            var html, htmlInc, htmlExp, newHtml, element;
            
            //create HTML string with placeholder text
            
            htmlInc = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            
            htmlExp = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            
            
            //determine si c'est un revenu ou une depense
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = htmlInc;
            } else {
                element = DOMstrings.expensesContainer;
                html = htmlExp;
            }
            
            //replace the placeholder text
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //insert the HTML into the DOM
            
            document.querySelector(element).insertAdjacentHTML('afterbegin', newHtml);
            
        }, 
        
        //supprime un element dans les colonnes
        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        //affiche les totaux
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomesLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        
        displayPercentages: function (percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            
            
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0 ) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
                
            });
            
            
        },
        
        displayMonth: function() {
            
            var now, year, months, month;
            
            var now = new Date();
            year = now.getFullYear();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
            
        },
        
        //vide les fields apres un ajout
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
                
            });
            
            fieldsArr[0].focus();
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ', ' +
                DOMstrings.inputDescription + ', ' +
                DOMstrings.inputValue
            
            );
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },
        
        //getter de la liste de class css
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
    
})();






//global app controller, gere le fonctionement des boutons
var controller = (function(budgetCtrl, UICtrl) {
    
    //ajoute les gestions d'evenements
    var setupEventListeners = function() {
        
        //get DOMs 
        var DOM = UICtrl.getDOMstrings();

        //bouton ajouter eventListeners pour click et ENTER
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        
    }
    
    
    //calcul les totaux dans le budget controller et le met a jour dans le UI
    var updateBudget = function() {
        
        //calculate the budget
        budgetCtrl.calculateBudget();
        
        //return the budget
        var budget = budgetCtrl.getBudget();
        
        
        //display the budget on the UI
        UICtrl.displayBudget(budget);
        
    };
    
    
    var updatePercentages = function() {
        
        //calculate percentages
        budgetCtrl.calculatePercentages();
        
        
        //read percentages from the budget controler
        var percentages = budgetCtrl.getPercentages();
        
        
        //update the UI 
        UICtrl.displayPercentages(percentages);
        
        
    }
    
    
    //bouton ajouter
    var ctrlAddItem = function () {
        
        var input, newItem, allInc, totals, sumExp;
        
        // get the filed input data
        input = UICtrl.getInput();
        
        if (! isNaN(input.value) && input.value > 0){
            //add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //clear fields
            UICtrl.clearFields();

            //calculate the budget
            updateBudget();
            
            //update percentages
            updatePercentages();
            
            console.log(budgetCtrl.getData());

        }
       
    }
    
    
    //bouton supprimer
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            //seperate the type and the id into two different strings
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();
            
            // 4. Calculate and update percentages
            updatePercentages();
            
            console.log(budgetCtrl.getData());
        }
    };
    
    
    
    //on renvoie un objet avec la fonction init() pour pouvoir l'utiliser dans le main
    return {
        init: function() {
            console.log('application has started');
            UICtrl.displayMonth();
            setupEventListeners();
            updateBudget();
        }
    }
    
    
})(budgetController, UIController);


controller.init();