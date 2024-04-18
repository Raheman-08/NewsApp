// Importing necessary modules from React and React Native
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';

// Importing SWR library for data fetching
import useSWR from 'swr';
import axios from 'axios'; // Axios for making HTTP requests
import * as Animatable from 'react-native-animatable'; // Animations library

// Interface for defining the structure of Category
interface Category {
  id: number;
  name: string;
}

// Interface for defining the structure of News
interface News {
  id: number;
  category: Category;
  heading: string;
  dateAdded: string;
  minRead: number;
  placeholderImage: string;
}

// Predefined categories
const categories: Category[] = [
  { id: 1, name: 'Technology' },
  { id: 2, name: 'Sports' },
  { id: 3, name: 'Politics' },
  { id: 4, name: 'Entertainment' },
  { id: 5, name: 'Science' },
];

// Function to fetch news data from API based on category
const fetchNewsData = async (category: string) => {
  const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=195dd350be484a4cbcd39f56b11b6f97`);
  return response.data.articles;
};

// Homescreen component
const Homescreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null); // State for selected category
  const [swipedCategories, setSwipedCategories] = useState<{ [key: string]: boolean }>({}); // State for swiped categories

  // Function to handle category selection
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  // Function to handle swipe to fetch news
  const handleSwipeToFetch = (categoryName: string) => {
    setSwipedCategories(prev => ({ ...prev, [categoryName]: true }));
  };

  // Function to fetch news for selected category
  const fetchNewsForSelectedCategory = async () => {
    if (!selectedCategory) return;
    const categoryName = selectedCategory.name.toLowerCase();
    handleSwipeToFetch(categoryName);
    const response = await fetchNewsData(categoryName);
    // Handle response
  };

  return (
    <View style={styles.container}>
      {/* Category selection section */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategorySelect(category)}
              style={[
                styles.category,
                selectedCategory && selectedCategory.id === category.id && styles.selectedCategory,
              ]}
            >
              <Text style={[styles.categoryText, selectedCategory && selectedCategory.id === category.id && styles.selectedCategoryText]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* News section */}
      <View style={styles.newsContainer}>
        {selectedCategory && !swipedCategories[selectedCategory.name.toLowerCase()] && (
          <SwipeToFetchNews category={selectedCategory.name} onSwipeToFetch={fetchNewsForSelectedCategory} />
        )}
        {selectedCategory && swipedCategories[selectedCategory.name.toLowerCase()] && (
          <NewsList category={selectedCategory.name} />
        )}
      </View>
    </View>
  );
};

// Component for swipe to fetch news
const SwipeToFetchNews: React.FC<{ category: string; onSwipeToFetch: () => void }> = ({ category, onSwipeToFetch }) => {
  return (
    <ScrollView
      contentContainerStyle={styles.swipeToFetchContainer}
      onScroll={(event) => {
        if (event.nativeEvent.contentOffset.y < -50) {
          onSwipeToFetch();
        }
      }}
      scrollEventThrottle={16}
    >
      <Text style={styles.swipeToFetchText}>Swipe down to fetch {category} news</Text>
    </ScrollView>
  );
};

// Component for rendering news list
const NewsList: React.FC<{ category: string }> = ({ category }) => {
  const { data: newsData, error, isValidating } = useSWR(category.toLowerCase(), fetchNewsData);

  return (
    <>
      {/* Error handling */}
      {error && <Text>Error fetching {category.toLowerCase()} news data</Text>}
      {/* Loading indicator */}
      {isValidating && <Text>Loading...</Text>}
      {/* Render news data */}
      {newsData && !isValidating && (
        <Animatable.View animation="rubberBand" duration={2000} iterationCount={1} style={styles.slideInUpContainer}>
          <FlatList
            data={newsData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.newsItem}>
                <View style={styles.newsDetails}>
                  <Text style={styles.newsHeading}>{item.title}</Text>
                  <View style={styles.metadataContainer}>
                    <Text style={styles.newsMetadata}>{new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                  </View>
                </View>
                <Image source={{ uri: item.urlToImage }} style={styles.newsImage} />
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </Animatable.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  category: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    height: 50,
    justifyContent: 'center'
  },
  selectedCategory: {
    backgroundColor: 'black',
  },
  categoryText: {
    fontSize: 16,
    color: 'black',
  },
  selectedCategoryText: {
    color: 'white',
  },
  newsContainer: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  newsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  newsDetails: {
    flex: 1,
    marginRight: 10,
  },
  newsHeading: {
    fontSize: 18,
    marginBottom: 5,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsMetadata: {
    color: '#888',
  },
  newsImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#ccc',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginBottom: 15,
    marginTop: 15,
  },
  swipeToFetchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeToFetchText: {
    fontSize: 18,
    color: '#888',
  },
  slideInUpContainer: {
    flex: 1,
  },
});

export default Homescreen;
