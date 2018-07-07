<template>
  <div class="home">
    <Layout class="home-layout">
      <Header class="home-header">
        <div class="userInfo">当前用户：{{ user.nickname }}({{ user.userName }})</div>
        <div class="home-nav-menu">
          <div class="home-nav-item">
            <Dropdown trigger="click"
                      @on-click="onSelectNavItem">
              <a>
                <Badge dot
                       :count="pendingFriendRequestsToMe.length+pendingGroupInvitationsToMe.length">
                  <span class="nav-label">通知</span>
                  <!-- <Icon type="ios-bell-outline"
                        size="18" /> -->
                  <Icon type="arrow-down-b" />
                </Badge>
              </a>
              <DropdownMenu slot="list">
                <DropdownItem name="showFriendRequests">
                  <Badge dot
                         :count="pendingFriendRequestsToMe.length">
                    好友请求
                  </Badge>
                </DropdownItem>

                <DropdownItem name="showGroupInvitation">
                  <Badge dot
                         :count="pendingGroupInvitationsToMe.length">
                    群聊邀请
                  </Badge>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div class="home-nav-item">
            <Dropdown trigger="click"
                      @on-click="onSelectNavItem">
              <a>
                <span class="nav-label">修改</span>
                <Icon type="arrow-down-b" />
              </a>
              <DropdownMenu slot="list">
                <DropdownItem name="changeInfo">修改信息</DropdownItem>
                <DropdownItem name="changePassword">修改密码</DropdownItem>
              </DropdownMenu>
            </Dropdown>

          </div>
          <div class="home-nav-item">
            <a @click="onSelectNavItem('logout');">
              <span class="nav-label">登出</span>
              <Icon type="log-out" />
            </a>
          </div>
        </div>
        <FriendRequestModal v-model="showFriendRequestModal" />
        <UserInfoModal v-model="showConfigInfoModal"
                       :editable="true"
                       :user-info="user"
                       @submitUserInfo="submitUserInfo" />
        <ChangePasswordModal v-model="showChangePasswordModal" />
        <GroupInvitationModal v-model="showGroupInvitationModal" />
      </Header>
      <Layout class="home-body">
        <Sider class="home-sider"
               ref="scrollbarContainer">
          <Menu theme="light"
                width="auto"
                :open-names="['friends', 'groups']"
                @on-select="$store.dispatch('getOneChat', $event);isEditingChatName=false;"
                @on-open-change="updateSidebarScroller">
            <Submenu name="friends">
              <template slot="title">
                <Icon type="ios-navigate" /> 好友
              </template>
              <MenuItem v-for="friend of friendList"
                        :key="friend.chatInfo.chatId"
                        :name="friend.chatInfo.chatId">{{ friend.friendInfo.nickname }}</MenuItem>
              <Button type="dashed"
                      long
                      icon="ios-plus-empty"
                      @click="addFriendModal = true;">添加好友</Button>
              <AddFriendModal v-model="addFriendModal" />
            </Submenu>
            <Submenu name="groups">
              <template slot="title">
                <Icon type="ios-keypad" /> 群聊
              </template>
              <MenuItem v-for="gChat of groupChats"
                        :key="gChat.chatId"
                        :name="gChat.chatId">{{ gChat.chatName }}</MenuItem>
              <Button type="dashed"
                      long
                      icon="ios-plus-empty"
                      @click="$store.dispatch('createGroupChat');">新建群聊</Button>
            </Submenu>
          </Menu>
        </Sider>
        <Layout class="home-chat"
                v-if="chatInfo">

          <Content class="home-chat-header">
            <h2 v-if="chatInfo&&!chatInfo.isGroup">
              与 {{ membersWithoutMe[0]?membersWithoutMe[0].userName:'' }} 的聊天
            </h2>
            <template v-if="chatInfo && chatInfo.isGroup">
              <h2>{{ chatInfo.chatName }}</h2>
              <Icon v-if="!isEditingChatName"
                    size="21"
                    type="edit"
                    style="margin-left: 5px;"
                    @click="newChatName=chatInfo.chatName;isEditingChatName=true;" />
              <template v-else>
                <Input class="chat-name-input"
                       v-model="newChatName"
                       placeholder="新群聊名称"
                       :disabled="changeChatNameLoading"></Input>
                <Button type="primary"
                        :disabled="!newChatName||newChatName===chatInfo.chatName||changeChatNameLoading"
                        @click="changeGroupChatName"
                        :loading="changeChatNameLoading">保存</Button>
                <Button @click="isEditingChatName=false;"
                        :disabled="changeChatNameLoading">取消</Button>
              </template>
            </template>
            <Dropdown class="chat-dropdown"
                      trigger="click"
                      placement="bottom-end"
                      @on-click="onSelectChatOption">
              <Button type="ghost"
                      icon="navicon-round"
                      size="small">更多</Button>
              <DropdownMenu slot="list">
                <template v-if="!chatInfo.isGroup">
                  <DropdownItem name="showFriendInfo">查看好友信息</DropdownItem>
                </template>
                <template v-else>
                  <DropdownItem name="showChatMembers">查看群聊成员</DropdownItem>
                  <DropdownItem name="inviteFriend">邀请好友加入</DropdownItem>
                  <DropdownItem name="quitGroup">退出群聊</DropdownItem>
                </template>
              </DropdownMenu>
            </Dropdown>

            <UserInfoModal v-model="showUserInfoModal"
                           :editable="false"
                           :user-info="membersWithoutMe[0]" />
            <ChatMembersModal v-model="showChatMembersModal" />
            <InviteFriendModal v-model="showInviteFriendModal" />
          </Content>

          <Content class="home-chat-content"
                   ref="container">
            <MessageWindow class="message-window"
                           :messages="messages"
                           :my-user-name="user.userName" />
          </Content>

          <Content class="home-chat-input">
            <Input class="chat-textarea"
                   v-model="chatInput"
                   @on-keydown="onInputKeydown"
                   type="textarea"
                   :rows="5"
                   placeholder="Enter换行，Ctrl+Enter发送"></Input>
          </Content>
        </Layout>
      </Layout>
    </Layout>

  </div>
</template>

<style scoped src="./home.styl"></style>

<script src="./home.ts"></script>
