export interface TopicListItem {
    TopicListId: number;
    TopicListName: string;
}

export interface CreateTopicPayload {
    TopicName: string;
    TopicList: TopicListItem[];
}

export interface ApiTopic {
    id: string;
    topicName: string;
    topicList: TopicListItem[];
    //... any other properties
}