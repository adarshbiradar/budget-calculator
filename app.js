
var budgetController = (function()
{
    var Expense = function(id,description,value)
    {
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };

    Expense.prototype.CalcPercentage = function(totalIncome)
    {
        if(totalIncome>0)
        {
        this.percentage=Math.round((this.value/totalIncome)*100);
        }
        else
        {
            this.percentage=-1;
        }   
    };
    Expense.prototype.getPercentage=function()
    {
        return this.percentage;
    };

    var Income = function(id,description,value)
    {
        this.id=id;
        this.description=description;
        this.value=value;
    };

    var calculateTotal = function(type)
    {
        var sum=0;
        data.allItems[type].forEach(function(curr)
        {
            sum+=curr.value;
        });
        data.totals[type]=sum;
    };
    //DATA STRUCTURE STORING ALL THE DATA
    var data = 
    {
        allItems:{
            inc:[],
            exp:[]
        },
        totals:{
           exp:0,
           inc:0, 
        },
        budget:0,
        percentage:-1,
    
    };

    return{
        addItem:function(type,des,val){
            var newItem,ID;

            //creat new id 
            if(data.allItems[type].length>0)
            {
            ID=data.allItems[type][data.allItems[type].length-1].id+1;
            }
            else
            {
                ID=0;
            }
            if(type==='exp')
            {
                 newItem = new Expense(ID,des,val);
            }
            else if(type==='inc')
            {
                newItem=new Income(ID,des,val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem:function(type,id)
        {
            var ids=data.allItems[type].map(function(current)
             {
                return current.id;
             });

             index = ids.indexOf(id);
             if(index !==-1)
             {
                data.allItems[type].splice(index,1);

             }


        },

        calculateBudget:function()
        {
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate total budget
            data.budget=data.totals.inc-data.totals.exp;
            //calculate the %income spent
            if(data.totals.inc>0)
            {
            data.percentage=Math.round(data.totals.exp/data.totals.inc*100);
            }
            else
            {
                data.percentage=-1;
            }
        },
        calculatePercentages:function()
        {
            data.allItems.exp.forEach(function(curr){
                curr.CalcPercentage(data.totals.inc);
            });
        },
        getPercentages:function()
        {
            var allPercentages = data.allItems.exp.map(function(cu)
            {
               return cu.getPercentage(); 
            });
            return allPercentages;
        },

        getBudget:function()
        {
            return{
                budget:data.budget,
                totalInc:data.totals.inc,
                totalexp:data.totals.exp,
                percentage:data.percentage,
            }
        },
        //testing Data Structures
        testing:function()
        {

            console.log(data);
        }
    }



})();


var UIController = (function()
{
    var DomStrings = 
    {
        inpuType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn : '.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensesPercentageLabel:'.item__percentage',
        dateLabel:'.budget__title--month'

    }
    
     var  formatNumber=function(num,type)
    {   var int,dec,numSplit,type ;
        num = Math.abs(num);
        num=num.toFixed(2);
        numSplit=num.split('.');

        int = numSplit[0];
        
        if(int.length>3)
        {
            int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
        }
        dec=numSplit[1];
        return  (type==='exp'?'-':'+') + ' ' + int + '.' + dec;
    };

    
    var nodeListForEach = function(list,callback)
    {
       for(var i=0;i<list.length;i++)
       {
           callback(list[i],i);
       }
    };



    return{
        getInput : function()
        {
         return {
         type:document.querySelector(DomStrings.inpuType).value,//either inc or exp
         description:document.querySelector(DomStrings.inputDescription).value,
         value:parseFloat(document.querySelector(DomStrings.inputValue).value)
         };
        },

        addListItem : function(obj,type)
        {
            //Creat HTML string with placehoalder 
        var html,newHtml,element;
        if(type==='inc')
        {
        element = DomStrings.incomeContainer;    
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>'+
            '<div class="right clearfix"><div class="item__value">%value%</div>'
            +'<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
        else if(type==='exp')
        {
            element=DomStrings.expensesContainer;
        html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>'+
        '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>'
            +'<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
            //replace place holder text
        newHtml=html.replace('%id%',obj.id);
        newHtml=newHtml.replace('%description%',obj.description);
        newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));

            //Insert HTML in DOM
        document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);



        },
        deleteListItem:function(selectorID)
        {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },





        displayPercentages : function(percentages)
        {
        var fields = document.querySelectorAll(DomStrings.expensesPercentageLabel);
           nodeListForEach(fields,function(current,index){
               if(percentages[index]>0)
               {
                current.textContent=percentages[index]+'%';
               }
               else
               {
                   current.textContent='--';
               }
            });
        },




        clearFields:function()
        {
        var fields,fieldsArr;
        fields=document.querySelectorAll(DomStrings.inputDescription+','+DomStrings.inputValue);
        
        fieldsArr = Array.prototype.slice.call(fields);

        fieldsArr.forEach(function(current,index,array){
            current.value='';
        });
        },


        displayMonth:function()
        {   
            var now,year,month,months;

            now = new Date();
            month=now.getMonth();
            months=["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
            year=now.getFullYear();
            document.querySelector(DomStrings.dateLabel).textContent=months[month] + ' '+ now.getFullYear();;
        },



        changedType :function()
        {
            var fields=document.querySelectorAll(
                DomStrings.inpuType + ','+
                DomStrings.inputDescription+','+
                DomStrings.inputValue

            );
            nodeListForEach(fields,function(curr)
            {
                curr.classList.toggle('red-focus');
            });
            document.querySelector(DomStrings.inputBtn).classList.toggle('red');

        },
        getDomStrings : function()
        {
            return DomStrings;
        },


        displayBudget:function(obj)
        {
            var type;
            obj.budget>0?type='inc':type='exp';

            document.querySelector(DomStrings.budgetLabel).textContent=formatNumber(obj.budget,type);
            document.querySelector(DomStrings.expensesLabel).textContent=formatNumber(obj.totalexp,'exp');
            document.querySelector(DomStrings.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
            document.querySelector(DomStrings.percentageLabel).textContent=obj.percentage+'%';
            if(obj.percentage<1)
            {
                document.querySelector(DomStrings.percentageLabel).textContent='--';
            }
        }
    };
})();
var controller =(function(budgetCtrl,UICtrl)
{
    var setupEventListner = function()
    {
        var DOM = UICtrl.getDomStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(event)
        {
           if(event.keyCode===13 || event.which===13)
           {
               ctrlAddItem();
           }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inpuType).addEventListener('change',UICtrl.changedType);
    };





    updateBudget = function()
    {
        //4.Calculate the budget
        budgetCtrl.calculateBudget();
        //Return the budget
        var budget = budgetCtrl.getBudget();
        updatePercentage();
        //5.Display the budget
        UICtrl.displayBudget(budget);
    };



    var updatePercentage = function()
    {
        //Calculate percentages
        budgetCtrl.calculatePercentages();

        //read the percentages from budget controller
        var percentages = budgetCtrl.getPercentages();

        //update the UI with new percentages
        UICtrl.displayPercentages(percentages);
    };






    
    var ctrlAddItem = function()
    {
        var input,newItem;
     //1.Get the input data

     input =UICtrl.getInput();
     console.log(input);

     if(input.description!=='' && !isNaN(input.value) && input.value>0)
     {
      //2.Add item to budget controller
      newItem = budgetController.addItem(input.type,input.description,input.value);
      //3.Add item to UI
      UICtrl.addListItem(newItem,input.type);
      //clear fields
      UICtrl.clearFields();
      
      //4.Calculate and update budget 
        updateBudget();
      // calculate and update the percentages

     }
    };


    var ctrlDeleteItem=function(event)
    {
        var itemID,splitID,type,ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID)
        {
            splitID = itemID.split('-');
            type=splitID[0];
            ID= parseInt(splitID[1]);
            //console.log(ID);

            // delete the item from the data structure
            budgetCtrl.deleteItem(type,ID);

            //delete the item from UI
            UICtrl.deleteListItem(itemID);
            
            //update and show the budget
            updateBudget();
        
        
        }
    };
    return{
        init:function()
        {
            console.log('Application is started ');
            UIController.displayMonth();
            UICtrl.displayBudget({budget:0,
                totalInc:0,
                totalexp:0,
                percentage:0});
            setupEventListner();
            
        }
    }

})(budgetController,UIController);


controller.init();