import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, SafeAreaView } from 'react-native';
import { ListItem, Button, Text, Icon } from "react-native-elements";
import * as Notifications from 'expo-notifications'
import * as Permissions from "expo-permissions";

// Components
import FloatingButton from "./components/FloatingButton";
import TaskItem from './components/TaskItem';
import TaskInput from './components/TaskInput';

// Constants
import Colors from "./constants/Colors";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true
    }
  }
});

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isAddMode, setIsAddMode] = useState(false)
  const [pushToken, setPushToken] = useState()
  const [refreshing, setRefreshing] = useState(false)

  // Ask for notification permissions
  useEffect(() => {
    Permissions.getAsync(Permissions.NOTIFICATIONS).then(statusObj => {
      if (statusObj.status !== 'granted') {
        return Permissions.askAsync(Permissions.NOTIFICATIONS);
      }
      return statusObj;
    }).then((statusObj) => {
      if (statusObj.status !== 'granted') {
        throw new Error('Permission not granted!')
      }
    }).then(() => {
      console.log('get Token')
      return Notifications.getExpoPushTokenAsync();
    }).then((response) => {
      const token = response.data;
      setPushToken(token)
    }).catch(err => {
      console.log(err)
      return null
    })
  }, [])

  // notification handler
  useEffect(() => {
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response)
    })

    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification)
    })

    return () => {
      backgroundSubscription.remove()
      foregroundSubscription.remove()
    }
  }, [])

  const addTaskHandler = taskTile => {
    setTasks([...tasks, { id: Math.random().toString(), value: taskTile, done: false }]);
    setIsAddMode(false)
  }

  const checkTask = taskId => {
    setTasks(currentTask => {
      return (currentTask.filter((task) => task.id !== taskId))
    })
  }

  const cancelGoalAdditionHandler = () => {
    setIsAddMode(false)
  }

  const triggerNotificationHandler = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "First local notification",
        body: "This is the first local notification"
      },
      trigger: {
        seconds: 5
      }
    });
    // try {
    //   fetch('https://exp.host/--/api/v2/push/send', {
    //     method: 'POST',
    //     headers: {
    //       Accept: 'application/json',
    //       'Accept-Encoding': 'gzip, deflate',
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       to: pushToken,
    //       data: { extraData: 'My Data' },
    //       title: 'Sent via the app',
    //       body: 'This push notification was setn via the app!'
    //     })
    //   })
    // } catch (error) {
    //   console.log(`Push POST token failed ${error.message}`)
    //   throw Error(error.message)
    // }
  }

  const onRefresh = useCallback(() => {
  }, [refreshing]);

  const flatlistOnEndReached = () => {
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>What's up, Martin</Text>
          <Text style={styles.subtitle}>Your tasks</Text>

          <TaskInput
            visible={isAddMode}
            onAddTask={addTaskHandler}
            onCancel={cancelGoalAdditionHandler} />

          <FlatList
            data={tasks}
            renderItem={({ item }) => (
              <ListItem
                key={item.id}
                id={item.id}
                onPress={() => checkTask(item.id)}
                bottomDivider>
                <ListItem.CheckBox
                  checked={false}
                  onPress={() => checkTask(item.id)}
                />
                <ListItem.Content>
                  <ListItem.Title>{item.value}</ListItem.Title>
                </ListItem.Content>
                <Icon
                  name='notifications'
                  onPress={() => { console.log('remind') }}
                />
              </ListItem>
            )}
          />

          <FloatingButton
            iconName='add'
            onPress={() => setIsAddMode(true)}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.greyBg
  },
  safeArea: {
    flex: 1,
    padding: 20
  },
  container: {
    padding: 20,
    flex: 1
  },
  title: {
    marginBottom: 20,
    fontSize: 30,
    fontWeight: "bold"
  },
  subtitle: {
    marginBottom: 15,
    fontSize: 15,
    color: Colors.grey
  }
});
