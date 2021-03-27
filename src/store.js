import { createStore } from 'vuex'
import Database from '../resource/Database';

// Create a new store instance.
const store = createStore({
  state () {
    return {
      productList:[],
      activePopup: ''
    }
  },
  mutations: {
    setProductList (state,{list}){
        state.productList = list;
    },
    setActivePopup(state,currentPopup){
      state.activePopup = currentPopup;
    }
  },
  actions: {
      async getProductList (context){
        const list = await Database.Model.Product.getProducts();
        context.commit('setProductList',{list});
      },
      async postProduct(context,obj){
        const product = await Database.Model.Product.createProduct(obj);
        await context.dispatch('getProductList');
        return product;
      }
  }
})

export default store;