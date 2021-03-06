import connection from "../helperFunctions/getConnection.js";
import { Payment } from './Payment';

const Op = connection.Sequelize.Op;

const Sale = connection.sequelize.define("sale", {
  id: {
    field: "saleId",
    type: connection.DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  customerId: {
    type: connection.DataTypes.INTEGER,
    allowNull: true,
  },
  productList: {
    type: connection.DataTypes.JSON,
    allowNull: false,
  },
  billingAddress: {
    type: connection.DataTypes.STRING,
    allowNull: true,
  },
  shippingAddress: {
    type: connection.DataTypes.STRING,
    allowNull: true,
  },
  placeOfSupply: {
    type: connection.DataTypes.STRING,
    allowNull: true,
  },
  poNumber: {
    type: connection.DataTypes.STRING,
    allowNull: true,
  },
  poDate: {
    type: connection.DataTypes.DATEONLY,
    allowNull: true,
  },
  dcNumber: {
    type: connection.DataTypes.STRING,
    allowNull: true,
  },
  dcDate: {
    type: connection.DataTypes.DATEONLY,
    allowNull: true,
  },
  drNumber: {
    type: connection.DataTypes.STRING,
    allowNull: true,
  },
  drDate: {
    type: connection.DataTypes.DATEONLY,
    allowNull: true,
  },
  totalPrice : {
    type: connection.DataTypes.FLOAT,
    allowNull: true,
  }
});

Sale.hasMany(Payment);
Payment.belongsTo(Sale);

const formatDate = function(date){
  let startDate = new Date(date.start.setHours(0,0,0,0));
  let endDate = new Date(date.end.setHours(23,59,59,999));
  return [startDate, endDate];
}

const createTable = async function() {
  await Sale.sync();
};

const getSales = async function(columnToSort,offset,order,date) {
  var sales;
  if(date !== null){
    sales = await Sale.findAndCountAll({
      order: [[columnToSort, order]],
      limit: 25,
      offset: (offset * 25),
      where: {
        createdAt: {
          [Op.between]: formatDate(date)
        }
      },
      include: [Payment]
    });
  }
  else
  {
    sales = await Sale.findAndCountAll({
      order: [[columnToSort, order]],
      limit: 25,
      offset: (offset * 25),
      include: [Payment]
    });
  }
  return sales;
};

const getSaleById = async function(id) {
    const sale = await Sale.findByPk(id,{include: [Payment]});
    if(sale === null){
      return null;
    }
    return sale;
};

const getSalesCustomerId = async function(cust_id,limit,columnToSort = "id") {
  const sales = await Sale.findAll({
    order: [[columnToSort, "ASC"]],
    where: {
      customerId: cust_id,
    },
    limit:limit,
    include: [Payment]
  });
  return sales;
};

const getChartDataByCustomerId= async function(cust_id){
  const sales = await Sale.findAll({
    attributes: [
      [ connection.sequelize.fn('strftime', '%m' , connection.sequelize.col('createdAt')), 'month'],
      [ connection.sequelize.fn('sum', connection.sequelize.col('totalPrice')), 'totalPrice'],
    ],
    where: {
      [Op.and]: [
        connection.sequelize.where(connection.sequelize.fn('strftime', '%Y', connection.sequelize.col('createdAt')), new Date().getFullYear().toString()),
        { customerId: cust_id, }
      ]
    },
    group: 'month'
  });
  return sales;
}

const createSale = async function(obj){
    const sale = await Sale.create({
        customerId : obj.customerId,
        productList: obj.productList,
        payments: obj.payments,
        totalPrice: obj.totalPrice
    },{
      include: [ Payment ]
    });
   return sale;
}

const updateSale = async function(obj,id){
  const res = await Sale.update(obj,{
    where: {
      id: id
    },
    include: [ Payment ]
  });
  return res[0] === 1 ? true : false;
}

const deleteSale = async function(id){
  const res = await Sale.destroy({
    where: {
      id: id
    },
  });
  return res === 1 ? true : false;
}

export { Sale };

export default {
  createTable,
  getSales,
  getSaleById,
  getSalesCustomerId,
  getChartDataByCustomerId,
  createSale,
  updateSale,
  deleteSale,
};


