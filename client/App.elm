module App exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput, onClick)
import Json.Encode
import Task
import Http
import Dict

import Api exposing (VerdictData, UserData, Verdict, populateVerdictData, extractUsers, AddUserResponse)

-- MODEL

type alias Model =
    { page : Page
    , data : VerdictData
    , users : List String
    , userId : String
    , keyword : String
    }



type Page
  = Table
  | About
  | AddUser


getVerdictData : Cmd Msg
getVerdictData = Http.send LoadData (Http.get "/stats" Api.apiDecoder)

getUserList : Cmd Msg
getUserList = Http.send LoadUserList (Http.get "/users" Api.userListDecoder)

postUserAdd : String -> String -> Cmd Msg
postUserAdd userId keyword =
    let
        -- TODO: refactor out to Api.elm ?
        body = Json.Encode.object
            [ ("userId", Json.Encode.string userId)
            , ("keyword", Json.Encode.string keyword)
            ]
        post = Http.post "/add" (Http.jsonBody body) Api.addUserResponseDecoder
    in
        Http.send LoadAddUserResponse post


init : ( Model, Cmd Msg )
init =
    ( Model Table Dict.empty [] "" "", getVerdictData )


-- MESSAGES


type Msg
    = NoOp
    | PageTransition Page
    | LoadData (Result Http.Error (List UserData))
    | LoadUserList (Result Http.Error (List String))
    | LoadAddUserResponse (Result Http.Error AddUserResponse)
    | NewUserId String
    | NewKeyword String
    | SubmitAddUser



-- VIEW


view : Model -> Html Msg
view model =
    div [ id "app" ]
        [ navbar
        , div [ class "container" ] [ content model ]
        ]


navbar : Html Msg
navbar =
    nav [ class "navbar navbar-toggleable-xl navbar-light bg-faded" ]
        [ div [ class "container" ]
            [ a
                [ class "navbar-brand", href "#", onClick (PageTransition Table) ]
                [ text "kyomusuke" ]
            , ul [ class "navbar-nav" ]
                [ li
                    [ class "nav-item active", onClick (PageTransition About) ]
                    [ a [ class "nav-link", href "#about" ]
                        [ text "about" ]
                    ]
                , li
                    [ class "nav-item active", onClick (PageTransition AddUser) ]
                    [ a [ class "nav-link", href "#addUser" ]
                        [ text "add" ]
                    ]
                ]
            ]
        ]


content : Model -> Html Msg
content model =
    case model.page of
        Table -> tableView model
        About -> p [] [ text "準備中..." ]
        AddUser -> addUserView


tableView : Model -> Html Msg
tableView model =
    let
        acToTd n = td [] [ text (toString n) ]
        enumUsers date =
            tr []
            ((th [ scope "row" ] [ text (Api.dateToString date) ]) ::
              List.map (Api.queryVerdict model.data date >> .ac >> acToTd) model.users)
        range = Api.dateRange Api.startDate Api.endDate
    in
        table [ class "table table-bordered table-sm" ]
            [ thead []
                [ tr []
                    ((th [] [ text "date" ]) ::
                    List.map (\x -> th [] [ text x ]) model.users)
                ]
            , tbody [] (List.map enumUsers range)
            ]


addUserView : Html Msg
addUserView =
    Html.form []
        [ div [ class "form-group" ]
            [ label [ for "userId" ] [ text "AOJユーザID" ]
            , input [ onInput NewUserId, class "form-control", id "userId", placeholder "AOJユーザID", type_ "text" ] []
            ]
        , div [ class "form-group" ]
            [ label [ for "keyword" ]
                [ text "キーワード" ]
            , input [ onInput NewKeyword, class "form-control", id "keyword", placeholder "キーワード", type_ "text" ] []
            ]
        , button [ onClick SubmitAddUser, class "btn btn-primary", type_ "submit" ] [ text "追加" ]
        ]


-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )
        PageTransition newPage ->
            ( { model | page = newPage }, Cmd.none )
        LoadData (Ok newData) ->
            ( { model | data = populateVerdictData newData }, getUserList )
        LoadData (Err e) ->
            Debug.log (toString e) ( model, Cmd.none )
        LoadUserList (Ok newUserList) ->
            ( { model | users = newUserList }, Cmd.none )
        LoadUserList (Err e) ->
            Debug.log (toString e) ( model, Cmd.none )
        LoadAddUserResponse (Ok addUserResponse) ->
            ( model, getVerdictData )
        LoadAddUserResponse (Err e) ->
            Debug.log (toString e) (model, Cmd.none )
        NewUserId newUserId ->
            ( { model | userId = newUserId }, Cmd.none )
        NewKeyword newKeyword ->
            ( { model | keyword = newKeyword }, Cmd.none )
        SubmitAddUser ->
            ( { model | page = Table }, postUserAdd model.userId model.keyword )

-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- MAIN


main : Program Never Model Msg
main =
    program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
