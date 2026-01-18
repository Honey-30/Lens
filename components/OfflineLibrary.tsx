import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookMarked, Heart, Calendar, ShoppingCart, Plus, 
  ChevronRight, Star, Clock, Trash2, X, Check, 
  Search, Filter, Folder, TrendingUp, ChefHat, 
  BarChart3, PieChart as PieChartIcon, Activity, Award,
  Flame, Utensils, Target, Zap
} from 'lucide-react';
import { offlineFeatures, MealPlan, ShoppingListItem, RecipeCollection } from '../services/offlineFeaturesService';
import { SavedRecipe } from '../types';
import { NeuralProtocol, Ingredient } from '../types';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

type OfflineStats = {
  totalRecipes: number;
  favoriteRecipes: number;
  totalCooks: number;
  plannedMeals: number;
  completedMeals: number;
  shoppingItems: number;
  uncheckedItems: number;
  mostCooked: SavedRecipe | null;
  favoriteCount: number;
  averageRating: number;
  mostCookedRecipe: string;
};

interface OfflineLibraryProps {
  onClose: () => void;
  currentInventory: Ingredient[];
  onLoadRecipe?: (protocol: NeuralProtocol) => void;
}

type ViewMode = 'recipes' | 'favorites' | 'meal-plan' | 'shopping' | 'collections' | 'stats';

const OfflineLibrary: React.FC<OfflineLibraryProps> = ({ onClose, currentInventory, onLoadRecipe }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('recipes');
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [favorites, setFavorites] = useState<SavedRecipe[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [collections, setCollections] = useState<RecipeCollection[]>([]);
  const [stats, setStats] = useState<OfflineStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);

  useEffect(() => {
    loadData();
  }, [viewMode]);

  const loadData = async () => {
    const [allRecipes, favs, plans, shopping, colls] = await Promise.all([
      offlineFeatures.getSavedRecipes(),
      offlineFeatures.getFavoriteRecipes(),
      offlineFeatures.getMealPlansForWeek(new Date().toISOString().split('T')[0]),
      offlineFeatures.getShoppingList(),
      offlineFeatures.getCollections(),
    ]);

    const statistics = await offlineFeatures.getStats() as OfflineStats;

    setRecipes(allRecipes);
    setFavorites(favs);
    setMealPlans(plans);
    setShoppingList(shopping);
    setCollections(colls);
    setStats(statistics);
  };

  const toggleFavorite = async (recipeId: string) => {
    await offlineFeatures.toggleFavorite(recipeId);
    await loadData();
  };

  const deleteRecipe = async (recipeId: string) => {
    await offlineFeatures.deleteRecipe(recipeId);
    setSelectedRecipe(null);
    await loadData();
  };

  const toggleShoppingItem = async (itemId: string) => {
    await offlineFeatures.toggleShoppingItem(itemId);
    await loadData();
  };

  const clearChecked = async () => {
    await offlineFeatures.clearCheckedItems();
    await loadData();
  };

  const filteredRecipes = recipes.filter(r => 
    r.protocol.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-neutral-950/60 backdrop-blur-xl px-4 md:px-8">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl h-[90vh] bg-gradient-to-br from-white via-neutral-25 to-neutral-50 rounded-[3rem] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.3)] border border-neutral-200/40 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-10 py-8 border-b border-neutral-200/40 flex items-center justify-between bg-white/60 backdrop-blur-xl">
          <div>
            <h2 className="text-4xl font-black tracking-[-0.03em] text-neutral-950 mb-2">
              Offline <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">Library</span>
            </h2>
            <p className="text-sm text-neutral-500 font-medium tracking-tight">
              {stats && `${stats.totalRecipes} recipes · ${stats.totalCooks} cooked · ${stats.favoriteRecipes} favorites`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-neutral-100 hover:bg-neutral-900 text-neutral-600 hover:text-white transition-all flex items-center justify-center group"
          >
            <X size={20} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-10 py-6 border-b border-neutral-200/30 bg-white/40 backdrop-blur-md flex gap-3 overflow-x-auto">
          {[
            { id: 'recipes' as ViewMode, label: 'All Recipes', icon: BookMarked, count: recipes.length },
            { id: 'favorites' as ViewMode, label: 'Favorites', icon: Heart, count: favorites.length },
            { id: 'meal-plan' as ViewMode, label: 'Meal Plans', icon: Calendar, count: mealPlans.length },
            { id: 'shopping' as ViewMode, label: 'Shopping List', icon: ShoppingCart, count: shoppingList.filter(i => !i.checked).length },
            { id: 'collections' as ViewMode, label: 'Collections', icon: Folder, count: collections.length },
            { id: 'stats' as ViewMode, label: 'Analytics', icon: BarChart3, count: 0 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = viewMode === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-[0.1em] transition-all flex items-center gap-3 whitespace-nowrap ${
                  isActive
                    ? 'bg-neutral-950 text-white shadow-lg'
                    : 'bg-white/60 text-neutral-600 hover:bg-white hover:text-neutral-900'
                }`}
              >
                <Icon size={14} strokeWidth={2.5} />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-primary-500 text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
          <AnimatePresence mode="wait">
            {/* Recipes View */}
            {viewMode === 'recipes' && (
              <motion.div
                key="recipes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Search */}
                <div className="relative mb-8">
                  <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400" strokeWidth={2.5} />
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white/70 backdrop-blur-xl border border-neutral-200/60 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
                  />
                </div>

                {/* Recipe Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe) => (
                    <motion.div
                      key={recipe.id}
                      whileHover={{ y: -4 }}
                      className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-neutral-200/40 shadow-md hover:shadow-xl transition-all cursor-pointer group"
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold tracking-tight text-neutral-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {recipe.protocol.name}
                          </h3>
                          <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                            {recipe.protocol.cuisineStyle}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(recipe.id);
                          }}
                          className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-rose-100 flex items-center justify-center transition-colors"
                        >
                          <Heart
                            size={16}
                            className={recipe.favorite ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'}
                            strokeWidth={2}
                          />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-neutral-600 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} strokeWidth={2.5} />
                          <span className="font-semibold">{recipe.protocol.timing?.total || recipe.protocol.duration_minutes || 0} min</span>
                        </div>
                        {recipe.cookCount > 0 && (
                          <div className="flex items-center gap-1.5">
                            <ChefHat size={12} strokeWidth={2.5} />
                            <span className="font-semibold">Cooked {recipe.cookCount}x</span>
                          </div>
                        )}
                      </div>

                      {recipe.rating && (
                        <div className="flex gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < recipe.rating! ? 'fill-primary-500 text-primary-500' : 'text-neutral-300'}
                              strokeWidth={2}
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {recipe.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-neutral-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-neutral-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredRecipes.length === 0 && (
                  <div className="py-20 text-center">
                    <BookMarked size={48} className="mx-auto mb-4 text-neutral-300" strokeWidth={1.5} />
                    <p className="text-lg font-semibold text-neutral-400 tracking-tight">
                      {searchQuery ? 'No recipes found' : 'No saved recipes yet'}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Shopping List View */}
            {viewMode === 'shopping' && (
              <motion.div
                key="shopping"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black tracking-tight text-neutral-900">
                    {shoppingList.filter(i => !i.checked).length} items to buy
                  </h3>
                  {shoppingList.some(i => i.checked) && (
                    <button
                      onClick={clearChecked}
                      className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                    >
                      Clear Checked
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {shoppingList.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      className={`p-5 bg-white/70 backdrop-blur-md rounded-2xl border transition-all ${
                        item.checked
                          ? 'border-neutral-200/30 opacity-50'
                          : 'border-neutral-200/60 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleShoppingItem(item.id)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            item.checked
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-neutral-300 hover:border-primary-500'
                          }`}
                        >
                          {item.checked && <Check size={14} className="text-white" strokeWidth={3} />}
                        </button>

                        <div className="flex-1">
                          <div className={`font-bold text-sm ${item.checked ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                            {item.name}
                          </div>
                          <div className="text-xs text-neutral-500 font-medium mt-0.5">
                            {item.quantity} {item.unit} · {item.category}
                          </div>
                        </div>

                        <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          item.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                          item.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>
                          {item.priority}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {shoppingList.length === 0 && (
                  <div className="py-20 text-center">
                    <ShoppingCart size={48} className="mx-auto mb-4 text-neutral-300" strokeWidth={1.5} />
                    <p className="text-lg font-semibold text-neutral-400 tracking-tight">Shopping list is empty</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Stats View */}
            {viewMode === 'stats' && renderStats()}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Recipe Detail Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center bg-neutral-950/70 backdrop-blur-xl p-8"
            onClick={() => setSelectedRecipe(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-white rounded-[3rem] p-10 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-neutral-950 mb-2">
                    {selectedRecipe.protocol.name}
                  </h2>
                  <p className="text-neutral-600 font-medium">{selectedRecipe.protocol.cuisineStyle}</p>
                </div>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-neutral-50 rounded-2xl">
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">Time</p>
                    <p className="text-2xl font-black text-neutral-900">{selectedRecipe.protocol.timing?.total || selectedRecipe.protocol.duration_minutes || 0}m</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-2xl">
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">Cooked</p>
                    <p className="text-2xl font-black text-neutral-900">{selectedRecipe.cookCount}x</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-2xl">
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">Calories</p>
                    <p className="text-2xl font-black text-neutral-900">{selectedRecipe.protocol.nutrition.calories}</p>
                  </div>
                </div>

                {selectedRecipe.notes && (
                  <div className="p-5 bg-amber-50 border border-amber-200/60 rounded-2xl">
                    <p className="text-sm text-amber-900 font-medium italic">{selectedRecipe.notes}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  {onLoadRecipe && (
                    <button
                      onClick={() => {
                        onLoadRecipe(selectedRecipe.protocol);
                        setSelectedRecipe(null);
                        onClose();
                      }}
                      className="flex-1 py-4 bg-neutral-950 text-white rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-neutral-800 transition-colors"
                    >
                      Load Recipe
                    </button>
                  )}
                  <button
                    onClick={() => deleteRecipe(selectedRecipe.id)}
                    className="px-6 py-4 bg-rose-100 text-rose-700 rounded-2xl font-bold hover:bg-rose-200 transition-colors"
                  >
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Stats rendering function
  function renderStats() {
    // Use component-level stats state, not getStats() directly
    const COLORS = ['#d4af37', '#c19a2f', '#ae8527', '#9b701f', '#886017'];
    
    // Prepare data for charts
    const recipesByCuisine = recipes.reduce((acc: any, recipe) => {
      const cuisine = recipe.protocol.cuisineStyle || 'Unknown';
      acc[cuisine] = (acc[cuisine] || 0) + 1;
      return acc;
    }, {});
    
    const cuisineData = Object.entries(recipesByCuisine).map(([name, value]) => ({
      name,
      value
    }));

    const cookingActivityData = recipes
      .slice(0, 10)
      .map(recipe => ({
        name: (recipe.protocol.name || recipe.protocol.title || 'Recipe').substring(0, 15) + '...',
        cooks: recipe.cookCount || 0,
        rating: recipe.rating || 0
      }));

    const nutritionData = recipes.length > 0 ? [
      { category: 'Protein', value: Math.round(recipes.reduce((acc, r) => acc + (r.protocol.nutritionalProfile?.protein || 0), 0) / recipes.length) },
      { category: 'Carbs', value: Math.round(recipes.reduce((acc, r) => acc + (r.protocol.nutritionalProfile?.carbs || 0), 0) / recipes.length) },
      { category: 'Fats', value: Math.round(recipes.reduce((acc, r) => acc + (r.protocol.nutritionalProfile?.fats || 0), 0) / recipes.length) },
      { category: 'Fiber', value: Math.round(recipes.reduce((acc, r) => acc + (r.protocol.nutritionalProfile?.fiber || 0), 0) / recipes.length) },
    ] : [];

    const difficultyData = recipes.reduce((acc: any, recipe) => {
      const difficulty = recipe.protocol.difficulty || 'medium';
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {});

    const diffData = Object.entries(difficultyData).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    return (
      <motion.div
        key="stats"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
              <BarChart3 size={28} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tight text-neutral-900">
                Culinary Analytics
              </h2>
              <p className="text-sm text-neutral-500 font-medium mt-1">
                Your cooking journey visualized
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <ChefHat size={32} className="text-white/80" strokeWidth={2} />
              <Award size={24} className="text-white/60" strokeWidth={2} />
            </div>
            <div className="text-5xl font-black text-white mb-1">{stats?.totalRecipes || 0}</div>
            <div className="text-sm font-bold text-white/80 uppercase tracking-wider">Total Recipes</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <Heart size={32} className="text-white/80" strokeWidth={2} />
              <Star size={24} className="text-white/60" strokeWidth={2} />
            </div>
            <div className="text-5xl font-black text-white mb-1">{stats?.favoriteCount || 0}</div>
            <div className="text-sm font-bold text-white/80 uppercase tracking-wider">Favorites</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <Flame size={32} className="text-white/80" strokeWidth={2} />
              <TrendingUp size={24} className="text-white/60" strokeWidth={2} />
            </div>
            <div className="text-5xl font-black text-white mb-1">
              {recipes.reduce((acc, r) => acc + (r.cookCount || 0), 0)}
            </div>
            <div className="text-sm font-bold text-white/80 uppercase tracking-wider">Total Cooks</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 bg-gradient-to-br from-violet-500 to-violet-600 rounded-3xl shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <Utensils size={32} className="text-white/80" strokeWidth={2} />
              <Target size={24} className="text-white/60" strokeWidth={2} />
            </div>
            <div className="text-5xl font-black text-white mb-1">{stats?.averageRating?.toFixed(1) || '0.0'}</div>
            <div className="text-sm font-bold text-white/80 uppercase tracking-wider">Avg Rating</div>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* Cuisine Distribution */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <PieChartIcon size={24} className="text-primary-600" strokeWidth={2.5} />
              <h3 className="text-xl font-black tracking-tight text-neutral-900">Cuisine Styles</h3>
            </div>
            {cuisineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cuisineData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cuisineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e5e5',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-neutral-400 font-semibold">No recipes yet</p>
              </div>
            )}
          </motion.div>

          {/* Cooking Activity */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Activity size={24} className="text-emerald-600" strokeWidth={2.5} />
              <h3 className="text-xl font-black tracking-tight text-neutral-900">Top Recipes</h3>
            </div>
            {cookingActivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cookingActivityData}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fontWeight: 600 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis tick={{ fontSize: 12, fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e5e5',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Bar dataKey="cooks" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-neutral-400 font-semibold">No cooking activity yet</p>
              </div>
            )}
          </motion.div>

          {/* Average Nutrition */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Target size={24} className="text-violet-600" strokeWidth={2.5} />
              <h3 className="text-xl font-black tracking-tight text-neutral-900">Avg. Nutrition Profile</h3>
            </div>
            {nutritionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={nutritionData}>
                  <PolarGrid stroke="#d4af37" strokeWidth={1} />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fontSize: 13, fontWeight: 700, fill: '#171717' }}
                  />
                  <PolarRadiusAxis tick={{ fontSize: 11, fontWeight: 600 }} />
                  <Radar 
                    name="Nutrition" 
                    dataKey="value" 
                    stroke="#d4af37" 
                    fill="#d4af37" 
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e5e5',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-neutral-400 font-semibold">No nutrition data yet</p>
              </div>
            )}
          </motion.div>

          {/* Difficulty Distribution */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Zap size={24} className="text-amber-600" strokeWidth={2.5} />
              <h3 className="text-xl font-black tracking-tight text-neutral-900">Difficulty Levels</h3>
            </div>
            {diffData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={diffData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 13, fontWeight: 700 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e5e5',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Bar dataKey="value" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-neutral-400 font-semibold">No recipes yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Additional Insights */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-8 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl shadow-2xl mt-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={28} className="text-primary-400" strokeWidth={2.5} />
            <h3 className="text-2xl font-black tracking-tight text-white">Culinary Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <div className="text-3xl font-black text-white mb-2">
                {stats?.mostCookedRecipe?.split(' ').slice(0, 3).join(' ') || 'N/A'}
              </div>
              <div className="text-sm font-bold text-white/60 uppercase tracking-wider">Most Cooked</div>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <div className="text-3xl font-black text-white mb-2">
                {mealPlans.length}
              </div>
              <div className="text-sm font-bold text-white/60 uppercase tracking-wider">Active Meal Plans</div>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <div className="text-3xl font-black text-white mb-2">
                {shoppingList.length}
              </div>
              <div className="text-sm font-bold text-white/60 uppercase tracking-wider">Shopping Items</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }
};

export default OfflineLibrary;
